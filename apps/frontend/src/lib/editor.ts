import type { Editor, JSONContent } from '@tiptap/core';
import { backendUrl } from '@/lib/backend';

const STREAM_DELAY_MS = 50;
const MAX_CONCURRENCY = 4;

/**
 * Check if any text node in the selection range has marks.
 */
export function selectionHasMarks(editor: Editor, from: number, to: number): boolean {
  let hasMarks = false;

  editor.state.doc.nodesBetween(from, to, (node) => {
    if (node.isText && node.marks.length > 0) {
      hasMarks = true;
    }
  });

  return hasMarks;
}

/**
 * Get the JSON content of the selection as an array of inline nodes.
 */
export function getSelectionContent(editor: Editor, from: number, to: number): JSONContent[] {
  const slice = editor.state.doc.slice(from, to);
  return slice.content.toJSON() as JSONContent[];
}

/**
 * Extract text values from a content JSON array (e.g. from getSelectionContent).
 * Returns the texts in order, matching the text nodes.
 */
export function extractTexts(content: JSONContent[]): string[] {
  const texts: string[] = [];

  for (const node of content) {
    if (node.type === 'text' && node.text) {
      texts.push(node.text);
    }
    if (node.content) {
      texts.push(...extractTexts(node.content));
    }
  }

  return texts;
}

/**
 * Rebuild a content JSON array by replacing text values with translated ones.
 * The translatedTexts array must be in the same order as extractTexts returns.
 */
export function rebuildContent(content: JSONContent[], translatedTexts: string[]): JSONContent[] {
  let index = 0;

  function rebuild(nodes: JSONContent[]): JSONContent[] {
    return nodes.map((node) => {
      const clone = { ...node };

      if (clone.type === 'text' && clone.text) {
        clone.text = translatedTexts[index++] ?? clone.text;
      }
      if (clone.content) {
        clone.content = rebuild(clone.content);
      }

      return clone;
    });
  }

  return rebuild(content);
}

export interface TranslateDocumentOptions {
  editor: Editor;
  language: string;
  fetcher: (url: string, options: any) => Promise<any>;
  onProgress?: (translated: number, total: number) => void;
}

interface TranslatableBlock {
  pos: number;
  nodeSize: number;
  json: JSONContent;
  texts: string[];
}

/**
 * Collect top-level blocks that contain translatable text.
 * Skips blocks with no text nodes (images, code blocks, rules, etc.).
 */
function collectTranslatableBlocks(editor: Editor): TranslatableBlock[] {
  const blocks: TranslatableBlock[] = [];
  const doc = editor.state.doc;

  doc.forEach((node, offset) => {
    const json = node.toJSON() as JSONContent;
    const texts = extractTexts(json.content ?? []);

    if (texts.length > 0) {
      blocks.push({
        pos: offset,
        nodeSize: node.nodeSize,
        json,
        texts,
      });
    }
  });

  return blocks;
}

/**
 * Run async tasks with a max concurrency limit.
 * Tasks are started up to `limit` at a time; as one finishes, the next starts.
 * Results are returned in the same order as the input.
 */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      results[index] = await tasks[index]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());

  await Promise.all(workers);

  return results;
}

/**
 * Translate an entire document block by block.
 *
 * - Collects all top-level blocks that have text content
 * - Fires translation requests with a concurrency limit
 * - Replaces each block in-place as its translation arrives (top to bottom)
 */
export async function translateDocument(opts: TranslateDocumentOptions) {
  const { editor, language, fetcher, onProgress } = opts;

  const blocks = collectTranslatableBlocks(editor);

  if (blocks.length === 0) return;

  // Create a fetch task for each block (not started yet)
  const tasks = blocks.map((block) => {
    return async () => {
      const result = await fetcher('/api/ai/translate/batch', {
        method: 'POST',
        body: { texts: block.texts, language },
      });
      return result.texts as string[];
    };
  });

  // Fire requests with concurrency limit, get results in order
  const results = await runWithConcurrency(tasks, MAX_CONCURRENCY);

  // Replace blocks top-to-bottom, tracking cumulative position shift
  let completed = 0;
  let posShift = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const translatedTexts = results[i];

    const translatedJson = {
      ...block.json,
      content: rebuildContent(block.json.content ?? [], translatedTexts),
    };

    // Adjust position based on cumulative shift from previous replacements
    const from = block.pos + posShift;
    const oldNode = editor.state.doc.nodeAt(from);

    if (!oldNode) continue;

    const to = from + oldNode.nodeSize;

    editor.chain()
      .focus()
      .insertContentAt({ from, to }, translatedJson)
      .run();

    // Track how much the position shifted after this replacement
    const newNode = editor.state.doc.nodeAt(from);
    if (newNode) {
      posShift += newNode.nodeSize - oldNode.nodeSize;
    }

    // Small delay between blocks for the progressive reveal effect
    await new Promise((r) => setTimeout(r, STREAM_DELAY_MS));

    completed++;
    onProgress?.(completed, blocks.length);
  }
}

/**
 * One entry per text node in the document, recording:
 * - `charOffset`  where this text node begins in the flat utterance string
 * - `pmFrom`      the ProseMirror position of its first character
 * - `length`      number of characters in the text node
 *
 * Together these let us convert any `charIndex` from a SpeechSynthesis
 * `boundary` event back into a ProseMirror `{ from, to }` range so we can
 * place a decoration exactly on the word being spoken.
 */
export interface SpeechSegment {
  charOffset: number;
  pmFrom: number;
  length: number;
}

export interface SpeechMap {
  /** The flat string passed verbatim to SpeechSynthesisUtterance. */
  text: string;
  /** Parallel map from utterance character positions → ProseMirror positions. */
  segments: SpeechSegment[];
}

/**
 * Walk the document and build both the utterance string and the position map
 * in a single pass.
 *
 * Uses `doc.descendants()` instead of a manual `forEach` chain so that deeply
 * nested structures (lists, blockquotes, nested list items, etc.) are visited
 * correctly.  `descendants` provides the **absolute** ProseMirror position of
 * every node, so we never have to compute offsets manually.
 *
 * Adjacent text nodes inside the same leaf block are appended directly —
 * the space separator is only injected when we cross a block boundary
 * (detected by tracking the last seen block depth).
 *
 * Why a flat string + segment array instead of per-word slices?
 * The `boundary` event gives us a `charIndex` into the utterance string, not
 * a pre-tokenised word list.  Keeping segments at text-node granularity means
 * we never have to replicate the browser's word-splitting logic — we just find
 * which text node owns `charIndex` and compute the ProseMirror position
 * arithmetically.
 */
export function buildSpeechMap(editor: Editor): SpeechMap {
  const segments: SpeechSegment[] = [];
  let flat = '';

  // Track the ProseMirror position of the last text node's parent block so we
  // can insert a space whenever we enter a new block.
  let lastBlockPos = -1;

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    // `pos` is the absolute position of the first character of this text node.
    // Walk up via the resolved position to find the depth-1 block ancestor so
    // we can detect block transitions for the space separator.
    const resolved = editor.state.doc.resolve(pos);
    // depth 0 = doc, depth 1 = top-level block, depth 2+ = nested block.
    // We want the deepest block that directly contains this text node.
    const blockPos = resolved.before(resolved.depth);

    if (blockPos !== lastBlockPos) {
      // Entering a new block — add a separating space (unless it's the very
      // first text node) so TTS pauses naturally between blocks.
      if (flat.length > 0) flat += ' ';
      lastBlockPos = blockPos;
    }

    segments.push({
      charOffset: flat.length,
      pmFrom: pos,
      length: node.text.length,
    });

    flat += node.text;
  });

  return { text: flat, segments };
}

/**
 * Given a `charIndex` + `charLength` from a SpeechSynthesis `boundary` event,
 * find the ProseMirror `{ from, to }` range for that word.
 *
 * Returns `null` if `charIndex` falls outside every known text segment
 * (e.g. it landed on an inter-block space).
 */
export function charIndexToPmRange(
  segments: SpeechSegment[],
  charIndex: number,
  charLength: number,
): { from: number; to: number } | null {
  for (const seg of segments) {
    const segEnd = seg.charOffset + seg.length;
    if (charIndex >= seg.charOffset && charIndex < segEnd) {
      const localOffset = charIndex - seg.charOffset;
      const from = seg.pmFrom + localOffset;
      // Clamp to the segment boundary in case the word spans a gap.
      const to = from + Math.min(charLength, segEnd - charIndex);
      return { from, to };
    }
  }
  return null;
}

/**
 * One chunk of TTS audio + word timestamps, as returned by the backend.
 * Mirrors the TtsChunk interface in tts.service.ts.
 */
export interface TtsWord {
  word: string;
  startMs: number;
  endMs: number;
}

export interface TtsChunk {
  audioUrl: string;
  words: TtsWord[];
}

/**
 * Split the document into one plain-text string per top-level block, suitable
 * for sending to the backend TTS endpoint.
 *
 * Each entry in the returned array corresponds to a single block (paragraph,
 * heading, list, blockquote, etc.).  Blocks with no readable text (images,
 * horizontal rules) are skipped entirely — they have nothing to synthesise.
 *
 * The chunk index is meaningful: the frontend later maps chunk[i] back to
 * `buildSpeechMap` segments to find which ProseMirror positions to highlight
 * while chunk[i] is playing.
 */
export function extractChunks(editor: Editor): string[] {
  const chunks: string[] = [];

  editor.state.doc.forEach((blockNode) => {
    // Collect all text content from this block recursively.
    const parts: string[] = [];
    blockNode.descendants((node) => {
      if (node.isText && node.text) parts.push(node.text);
    });

    const text = parts.join(' ').trim();
    if (text) chunks.push(text);
  });

  return chunks;
}

export interface StreamInsertOptions {
  editor: Editor;
  url: string;
  token: string;
  body: Record<string, unknown>;
  from: number;
  to: number;
  onCancel: () => void;
  cancelledRef: { current: boolean };
  readerRef: { current: ReadableStreamDefaultReader<Uint8Array> | null };
}

/**
 * Stream an SSE response from the backend and insert words one by one
 * into the editor at the given position. Used for plain text (no marks).
 */
export async function streamInsertText(opts: StreamInsertOptions) {
  const { editor, url, token, body, from, to, onCancel, cancelledRef, readerRef } = opts;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || (!e.metaKey && !e.ctrlKey && !e.altKey)) {
      onCancel();
    }
  };
  const editorDom = editor.view.dom;
  editorDom.addEventListener('keydown', onKeyDown);

  let insertPos = from;
  let deleted = false;

  try {
    const res = await fetch(backendUrl(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      throw new Error('Stream request failed');
    }

    const reader = res.body.getReader();
    readerRef.current = reader;
    const decoder = new TextDecoder();
    let buffer = '';

    while (!cancelledRef.current) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (cancelledRef.current) break;
        if (!line.startsWith('data: ')) continue;

        const payload = line.slice(6);
        if (payload === '[DONE]') break;

        const { text, error } = JSON.parse(payload);
        if (error) throw new Error(error);

        if (text) {
          // Delete original text only once, right before first insertion
          if (!deleted) {
            editor.chain().focus().deleteRange({ from, to }).run();
            insertPos = from;
            deleted = true;
          }

          const words = text.match(/\S+\s*/g) || [text];
          for (const word of words) {
            if (cancelledRef.current) break;
            await new Promise((r) => setTimeout(r, STREAM_DELAY_MS));
            editor.chain().focus().insertContentAt(insertPos, word).run();
            insertPos += word.length;
          }
        }
      }
    }
  } finally {
    editorDom.removeEventListener('keydown', onKeyDown);
    readerRef.current = null;
  }
}
