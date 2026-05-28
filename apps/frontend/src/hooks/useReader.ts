import { useCallback, useEffect, useRef, useState } from 'react';
import type { TiptopEditorHandle } from 'tiptop-editor';
import { buildSpeechMap, charIndexToPmRange, extractChunks, TtsChunk, SpeechSegment } from '@/lib/editor';

export type ReaderState = 'idle' | 'loading' | 'playing' | 'paused';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// Internal representation of one fully-decoded chunk, ready to be scheduled.
interface DecodedChunk {
  buffer: AudioBuffer;
  words: TtsChunk['words'];
  // Offset in seconds from the start of the full playback timeline.
  // Assigned when the chunk is scheduled on the AudioContext.
  startOffset: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useReader — manages all TTS state for the draft reader feature.
 *
 * Flow on play():
 *   1. Extract document text as chunks (one per block) via extractChunks().
 *   2. Build the position map (buildSpeechMap) so we can highlight words.
 *   3. POST to /api/tts/speak — backend returns audio + word timestamps,
 *      hitting the DB cache when the text hasn't changed.
 *   4. Decode the base64 MP3s into AudioBuffers via Web Audio API.
 *   5. Schedule all buffers back-to-back on the AudioContext and start playing.
 *   6. Run a requestAnimationFrame loop that compares AudioContext.currentTime
 *      against word timestamps to fire setReaderHighlight at the right moment.
 *
 * On pause(): AudioContext.suspend() — resumes from the exact same sample.
 * On stop():  AudioContext.close() + clearReaderHighlight.
 *
 * Cache awareness:
 *   The hook stores the last fetched chunks alongside the content hash
 *   (SHA-256 of the joined chunk texts).  If the user clicks play twice
 *   without changing the document, we skip the network request entirely
 *   and decode the cached response again.  The backend also caches, so even
 *   on a cache miss here the round-trip is cheap after the first time.
 */
export function useReader(
  editorRef: React.RefObject<TiptopEditorHandle | null>,
  fetcher: (url: string, options: any) => Promise<any>,
  draftId: string,
  language = 'en',
) {
  const [readerState, setReaderState] = useState<ReaderState>('idle');

  // Web Audio context — created lazily on first play, closed on stop.
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Animation frame handle so we can cancel the highlight loop.
  const rafRef = useRef<number | null>(null);

  // Cached backend response keyed by the content hash so repeated play()
  // calls on unchanged content skip the network entirely.
  const ttsChunksCacheRef = useRef<{ hash: string; chunks: TtsChunk[] } | null>(null);

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Compute a cheap content hash from the chunk array.
   * Not cryptographic — just used to detect whether the document changed
   * since the last fetch.  We concatenate chunk texts and hash with the
   * browser's SubtleCrypto API.
   *
   * Returns a hex string, asynchronously.
   */
  const hashChunks = useCallback(async (chunks: string[]): Promise<string> => {
    const encoded = new TextEncoder().encode(chunks.join('\n'));
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }, []);

  /**
   * Decode a base64-encoded MP3 string into an AudioBuffer.
   * Uses the provided AudioContext so buffers are compatible with the
   * destination that will play them.
   */
  const decodeChunk = useCallback(
    async (audioCtx: AudioContext, url: string): Promise<AudioBuffer> => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return audioCtx.decodeAudioData(arrayBuffer);
    },
    [],
  );

  /**
   * Cancel the rAF highlight loop if it's running.
   */
  const cancelHighlightLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  /**
   * Clear the word-highlight decoration and reset to idle.
   * Called by stop(), and by the audio end event.
   */
  const clearHighlightAndReset = useCallback(() => {
    cancelHighlightLoop();
    editorRef.current?.getEditor()?.commands.clearReaderHighlight();
    setReaderState('idle');
  }, [editorRef, cancelHighlightLoop]);

  /**
   * Start the requestAnimationFrame loop that drives word highlighting.
   *
   * For each frame we compute the current playback position in milliseconds
   * (audioCtx.currentTime - playbackStartTime) and find the word whose
   * [startMs, endMs) window contains that position across all chunks.
   *
   * @param audioCtx       The running AudioContext.
   * @param startTime      The audioCtx.currentTime value when playback began.
   * @param decoded        All decoded chunks with their scheduled startOffsets.
   * @param segments       The ProseMirror position map from buildSpeechMap.
   * @param chunkCharOffsets  For each chunk, the charOffset of its first character
   *                          in the flat speech-map string, so we can convert
   *                          word indices to ProseMirror positions.
   */
  const startHighlightLoop = useCallback(
    (
      audioCtx: AudioContext,
      startTime: number,
      decoded: DecodedChunk[],
      segments: SpeechSegment[],
      chunkCharOffsets: number[],
    ) => {
      // Track last highlighted word to avoid redundant decoration updates.
      let lastHighlightKey = '';

      function tick() {
        if (audioCtx.state === 'closed') return;
        const editor = editorRef.current?.getEditor();
        if (!editor) return;

        // currentTime advances even during suspend, but we only started
        // incrementing from startTime, so subtract to get elapsed playback ms.
        const elapsedMs = (audioCtx.currentTime - startTime) * 1000;

        // Find which chunk and word is active at this moment.
        for (const chunk of decoded) {
          const chunkStartMs = chunk.startOffset * 1000;

          for (let wi = 0; wi < chunk.words.length; wi++) {
            const wordDef = chunk.words[wi];
            const absStartMs = chunkStartMs + wordDef.startMs;
            const absEndMs = chunkStartMs + wordDef.endMs;

            if (elapsedMs >= absStartMs && elapsedMs < absEndMs) {
              const key = `${chunk.startOffset}-${wi}`;
              if (key === lastHighlightKey) break; // same word, no update needed
              lastHighlightKey = key;

              // Find where this word sits in the flat speech-map string.
              // The word is wi-th in its chunk; we need to map it to a char
              // offset so charIndexToPmRange can find the ProseMirror position.
              const chunkOffset = chunkCharOffsets[decoded.indexOf(chunk)] ?? 0;

              // Compute charIdx by summing the lengths of the preceding words
              // plus one separator space each — consistent with how chunkCharOffsets
              // are built in the play() loop above.
              let charIdx = chunkOffset;
              for (let skip = 0; skip < wi; skip++) {
                charIdx += chunk.words[skip].word.length + 1;
              }

              const range = charIndexToPmRange(
                segments,
                charIdx,
                wordDef.word.length,
              );
              if (range) {
                editor.commands.setReaderHighlight(range.from, range.to);
              }
              break;
            }
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [editorRef],
  );

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Start or resume playback.
   *
   * If paused: resume the AudioContext (picks up from the exact sample).
   * If idle:   fetch TTS (or use client-side cache), decode audio, schedule
   *            all buffers, start the highlight loop.
   */
  const play = useCallback(async () => {
    // Resume from pause — AudioContext retains its position.
    if (readerState === 'paused' && audioCtxRef.current) {
      await audioCtxRef.current.resume();
      setReaderState('playing');
      return;
    }

    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    setReaderState('loading');

    try {
      // 1. Extract chunks and build position map simultaneously.
      const chunks = extractChunks(editor);
      if (!chunks.length) { setReaderState('idle'); return; }

      const { segments } = buildSpeechMap(editor);

      // 2. Fetch TTS — use client cache to skip the request when unchanged.
      const hash = await hashChunks(chunks);
      let ttsChunks: TtsChunk[];

      if (ttsChunksCacheRef.current?.hash === hash) {
        ttsChunks = ttsChunksCacheRef.current.chunks;
      } else {
        const res = await fetcher('/api/tts/speak', {
          method: 'POST',
          body: { draftId, chunks, language },
        });
        ttsChunks = res.chunks as TtsChunk[];
        ttsChunksCacheRef.current = { hash, chunks: ttsChunks };
      }

      // 3. Create a fresh AudioContext for this playback session.
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      // 4. Decode all base64 MP3s into AudioBuffers.
      const audioBuffers = await Promise.all(
        ttsChunks.map((c) => decodeChunk(audioCtx, c.audioUrl)),
      );

      // 5. Schedule all buffers back-to-back on the timeline.
      //    Track the char offset of each chunk's first character in the flat
      //    speech-map string, so the highlight loop can find ProseMirror positions.
      const decoded: DecodedChunk[] = [];
      const chunkCharOffsets: number[] = [];
      let timeOffset = 0;
      let charOffset = 0;

      // Capture the reference time once before scheduling so all buffers
      // and the highlight loop share the exact same timeline base.
      const playbackStartTime = audioCtx.currentTime;

      for (let i = 0; i < audioBuffers.length; i++) {
        const buf = audioBuffers[i];
        const source = audioCtx.createBufferSource();
        source.buffer = buf;
        source.connect(audioCtx.destination);
        source.start(playbackStartTime + timeOffset);

        decoded.push({
          buffer: buf,
          words: ttsChunks[i].words,
          startOffset: timeOffset,
        });

        chunkCharOffsets.push(charOffset);

        // Advance char offset by the number of characters in this chunk's words.
        charOffset += ttsChunks[i].words.reduce((acc, w) => acc + w.word.length + 1, 0);
        timeOffset += buf.duration;
      }

      // 6. Schedule cleanup at the end of all audio.
      const lastSource = audioCtx.createBufferSource();
      lastSource.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
      lastSource.connect(audioCtx.destination);
      lastSource.start(playbackStartTime + timeOffset);
      lastSource.onended = () => {
        // Guard against double-close: stop() may have already closed the context
        // before this event fires, which would throw an InvalidStateError.
        if (audioCtxRef.current === audioCtx) {
          audioCtxRef.current = null;
          audioCtx.close();
        }
        clearHighlightAndReset();
      };

      // 7. Start the highlight loop.
      startHighlightLoop(audioCtx, playbackStartTime, decoded, segments, chunkCharOffsets);

      setReaderState('playing');
    } catch {
      setReaderState('idle');
    }
  }, [readerState, editorRef, fetcher, draftId, hashChunks, decodeChunk, startHighlightLoop, clearHighlightAndReset]);

  /**
   * Pause playback. AudioContext.suspend() freezes the timeline in place —
   * resume() will continue from the exact same audio sample.
   */
  const pause = useCallback(async () => {
    if (audioCtxRef.current) {
      await audioCtxRef.current.suspend();
    }
    setReaderState('paused');
  }, []);

  /**
   * Stop playback entirely. Closes the AudioContext (which cancels all
   * scheduled sources), clears the highlight decoration, and resets to idle.
   * The next play() will rebuild everything from scratch (but will still hit
   * the client-side and backend caches if the text hasn't changed).
   */
  const stop = useCallback(() => {
    cancelHighlightLoop();
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    clearHighlightAndReset();
  }, [cancelHighlightLoop, clearHighlightAndReset]);

  // Stop playback and release the AudioContext when the component unmounts
  // so we don't leak a running context or a dangling rAF loop.
  useEffect(() => () => stop(), []);

  return { readerState, play, pause, stop };
}

