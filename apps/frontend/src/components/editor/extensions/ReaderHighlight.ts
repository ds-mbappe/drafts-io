import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * The plugin key is used to read and write this plugin's state from
 * anywhere that has access to the editor state (e.g. commands, decorations).
 */
export const readerHighlightKey = new PluginKey<DecorationSet>('readerHighlight');

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    readerHighlight: {
      /**
       * Highlight the word between `from` and `to` (ProseMirror positions).
       * Replaces any previous highlight — only one word is highlighted at a time.
       */
      setReaderHighlight: (from: number, to: number) => ReturnType;
      /**
       * Remove the current reader highlight decoration entirely.
       */
      clearReaderHighlight: () => ReturnType;
    };
  }
}

/**
 * ReaderHighlight — Tiptap extension that visually marks the word currently
 * being spoken by the Web Speech API.
 *
 * Implementation notes:
 * - Uses a ProseMirror **decoration** (Decoration.inline), NOT a mark.
 *   Decorations are purely visual and never mutate the document, so they
 *   don't trigger onUpdate / autosave and don't appear in the JSON content.
 * - The decoration is stored as plugin state (a DecorationSet). Commands
 *   communicate with the plugin by attaching metadata to a transaction via
 *   `tr.setMeta(readerHighlightKey, payload)`.
 * - `null` payload → clear; `{ from, to }` payload → replace with new range.
 */
export const ReaderHighlight = Extension.create({
  name: 'readerHighlight',

  addCommands() {
    return {
      setReaderHighlight:
        (from: number, to: number) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            // Attach the desired range as metadata so the plugin state
            // can pick it up and create the decoration.
            tr.setMeta(readerHighlightKey, { from, to });
            dispatch(tr);
          }
          return true;
        },

      clearReaderHighlight:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            // null signals the plugin to clear the DecorationSet.
            tr.setMeta(readerHighlightKey, null);
            dispatch(tr);
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: readerHighlightKey,

        state: {
          // Start with no highlight.
          init: () => DecorationSet.empty,

          apply(tr, currentSet) {
            const meta = tr.getMeta(readerHighlightKey);

            // Explicit clear.
            if (meta === null) return DecorationSet.empty;

            // New highlight range provided — replace the existing decoration.
            if (meta) {
              const { from, to } = meta as { from: number; to: number };
              return DecorationSet.create(tr.doc, [
                Decoration.inline(from, to, { class: 'reader-highlight' }),
              ]);
            }

            // For any other transaction (typing, formatting, etc.) map the
            // existing decoration set forward so it stays in sync with the doc.
            return currentSet.map(tr.mapping, tr.doc);
          },
        },

        props: {
          // Use the plugin key explicitly — avoids relying on `this` binding
          // which is unreliable in strict ESM environments and can return
          // undefined, silently breaking ProseMirror's decoration pipeline.
          decorations(state) {
            return readerHighlightKey.getState(state) ?? DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

export default ReaderHighlight;
