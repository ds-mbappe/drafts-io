import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { v1beta1 } from '@google-cloud/text-to-speech';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from 'src/utils/cloudinary.service';
import { handleHttpError } from 'src/utils/handle-http-error';

// One word entry as stored in the DB and returned to the frontend.
// startMs / endMs are milliseconds relative to the start of the chunk's audio.
export interface TtsWord {
  word: string;
  startMs: number;
  endMs: number;
}

// One rendered block: Cloudinary MP3 URL + word timestamps.
export interface TtsChunk {
  audioUrl: string;
  words: TtsWord[];
}

const MAX_CONCURRENCY = 4;

// Maps the language key sent by the frontend to a Google TTS Neural2 voice.
// Language is included in the content hash so per-language caches never collide.
const VOICE_MAP: Record<string, { languageCode: string; voiceName: string }> = {
  en: { languageCode: 'en-US',  voiceName: 'en-US-Neural2-C' },
  fr: { languageCode: 'fr-FR',  voiceName: 'fr-FR-Neural2-C' },
  es: { languageCode: 'es-ES',  voiceName: 'es-ES-Neural2-C' },
  de: { languageCode: 'de-DE',  voiceName: 'de-DE-Neural2-C' },
  it: { languageCode: 'it-IT',  voiceName: 'it-IT-Neural2-A' },
  jp: { languageCode: 'ja-JP',  voiceName: 'ja-JP-Neural2-B' },
  pt: { languageCode: 'pt-BR',  voiceName: 'pt-BR-Neural2-C' },
  ar: { languageCode: 'ar-XA',  voiceName: 'ar-XA-Wavenet-C' },
  zh: { languageCode: 'cmn-CN', voiceName: 'cmn-CN-Neural2-C' },
  ko: { languageCode: 'ko-KR',  voiceName: 'ko-KR-Neural2-C' },
};
const DEFAULT_VOICE = VOICE_MAP.en;

@Injectable()
export class TtsService {
  private client: v1beta1.TextToSpeechClient;

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {
    this.client = new v1beta1.TextToSpeechClient();
  }

  /**
   * Main entry point.  Accepts a list of plain-text chunks (one per document
   * block) and returns a TtsChunk for each, with audio and word timestamps.
   *
   * Strategy:
   *   1. Hash the full text to produce a deterministic cache key.
   *   2. Return cached result immediately if it exists.
   *   3. Otherwise synthesise all chunks in parallel (up to MAX_CONCURRENCY),
   *      persist the result, then return it.
   */
  async speak(
    draftId: string,
    chunks: string[],
    language = 'en',
  ): Promise<TtsChunk[]> {
    if (!draftId || !chunks?.length) {
      throw new BadRequestException('draftId and chunks are required');
    }

    const contentHash = this.hashChunks(chunks, language);

    // --- Cache lookup ---
    const cached = await this.prisma.draftTts.findUnique({
      where: { draftId_contentHash: { draftId, contentHash } },
    });

    if (cached) {
      return cached.chunks as unknown as TtsChunk[];
    }

    // --- Cache miss: synthesise ---
    try {
      const result = await this.synthesiseAll(chunks, language);

      // Persist so future plays (by this user or any reader) are free.
      // Older entries for the same draft with a different hash are left in
      // place — they are cheap to store and may be reused if the author
      // reverts a change.  A periodic cleanup job can prune old entries later.
      await this.prisma.draftTts.create({
        data: {
          draftId,
          contentHash,
          chunks: result as unknown as Prisma.InputJsonValue,
        },
      });

      return result;
    } catch (error) {
      handleHttpError(error, 'Text-to-speech synthesis failed');
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * SHA-256 of all chunks joined by newline.
   * Two documents with identical text will always produce the same hash,
   * meaning readers share the cache with the author after the first synthesis.
   */
  // Language is included so French and English caches never collide for the same text.
  private hashChunks(chunks: string[], language: string): string {
    return createHash('sha256')
      .update(`${chunks.join('\n')}\n__lang:${language}`)
      .digest('hex');
  }

  private async synthesiseAll(
    chunks: string[],
    language: string,
  ): Promise<TtsChunk[]> {
    const tasks = chunks.map(
      (text) => () => this.synthesiseChunk(text, language),
    );
    return runWithConcurrency(tasks, MAX_CONCURRENCY);
  }

  private async synthesiseChunk(
    text: string,
    language: string,
  ): Promise<TtsChunk> {
    // Tokenise into words so we can wrap each one in a <mark> tag.
    // We split on whitespace and drop empty tokens.
    const words = text.split(/\s+/).filter(Boolean);

    // Build SSML: <mark name="w0"/>word <mark name="w1"/>word …
    // The mark fires *before* the word it precedes, which is what we want —
    // timepoint.timeSeconds is when that word starts.
    const ssmlBody = words
      .map((w, i) => `<mark name="w${i}"/>${escapeXml(w)}`)
      .join(' ');

    const ssml = `<speak>${ssmlBody}</speak>`;

    const voice = VOICE_MAP[language] ?? DEFAULT_VOICE;

    const [response] = await this.client.synthesizeSpeech({
      input: { ssml },
      voice: { languageCode: voice.languageCode, name: voice.voiceName },
      audioConfig: { audioEncoding: 'MP3' },
      // enableTimePointing: 1 = SSML_MARK — tells Google to return a timepoint
      // for every <mark> tag in the SSML, giving us per-word start times.
      enableTimePointing: [1],
    });

    const audioBuffer = Buffer.from(response.audioContent as Uint8Array);

    const upload = await this.cloudinary.uploadBuffer(audioBuffer, {
      folder: 'tts_audio',
      resource_type: 'video', // Cloudinary uses 'video' for audio files
      format: 'mp3',
    });

    const timepoints = response.timepoints ?? [];

    const wordTimings: TtsWord[] = timepoints.map((tp, idx) => {
      const nextTp = timepoints[idx + 1];
      return {
        word: words[idx] ?? '',
        startMs: Math.round((tp.timeSeconds ?? 0) * 1000),
        endMs: nextTp
          ? Math.round((nextTp.timeSeconds ?? 0) * 1000)
          : Math.round((tp.timeSeconds ?? 0) * 1000) + 500,
      };
    });

    return { audioUrl: upload.secure_url, words: wordTimings };
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Run async tasks with a max concurrency limit, preserving result order.
 * Identical to the implementation in lib/editor.ts on the frontend.
 */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results = new Array(tasks.length) as T[];
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const idx = next++;
      results[idx] = await tasks[idx]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );

  return results;
}

/**
 * Escape the five XML special characters so words with ampersands, quotes,
 * angle brackets etc. don't break the SSML.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
