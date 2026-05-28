import { useEffect, useMemo, useRef } from 'react';
import * as Y from 'yjs';
import type { TiptopEditorHandle, TiptopEditorOptions } from 'tiptop-editor';
import ExtensionKit from '../extensions/extension-kit';
import ReaderHighlight from '../extensions/ReaderHighlight';



const encodeYDocToBase64 = (ydoc: Y.Doc): string => {
  const bytes = Y.encodeStateAsUpdate(ydoc);
  return Buffer.from(bytes).toString('base64');
}

export const useBlockEditor = ({
  doc,
  yDoc,
  editable,
  autoFocus,
  debouncedUpdates,
  editorRef,
  showCommentMenu = false,
  showReaderHighlight = false,
}: {
  doc?: any,
  yDoc?: Y.Doc,
  editable: boolean,
  autoFocus: boolean,
  debouncedUpdates: Function,
  editorRef?: React.RefObject<TiptopEditorHandle | null>,
  showCommentMenu?: boolean,
  showReaderHighlight?: boolean,
}) => {
  const lastContentRef = useRef<string>('');
  const docContentRef = useRef(doc?.content);
  docContentRef.current = doc?.content;
  const editableRef = useRef(editable);
  editableRef.current = editable;
  // Immediately-updated snapshot — not debounced. Used by onCreate so that
  // when a tab panel unmounts/remounts the latest typed content is restored
  // even if the debounced state update hasn't fired yet.
  const latestContentRef = useRef<Record<string, any> | null>(null);

  // Sync editable flag and restore content when switching to read mode.
  // Uses a ref for doc.content so this effect only runs when editable changes,
  // not on every keystroke.
  useEffect(() => {
    const editor = editorRef?.current?.getEditor();
    if (!editor) return;

    editor.setEditable(editable);

    if (!editable && docContentRef.current) {
      editor.commands.setContent(docContentRef.current);
    }
  }, [editorRef, editable]);

  // Memoize so the array reference is stable across re-renders.
  // A new array on every render would cause tiptop-editor to recreate the editor.
  const extensions = useMemo(
    () => [...ExtensionKit(), ...(showReaderHighlight ? [ReaderHighlight] : [])],
    [showReaderHighlight],
  );

  const editorOptions: TiptopEditorOptions = {
    autofocus: autoFocus,
    editable,
    showCommentMenu,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
    },
    immediatelyRender: false,
    extraExtensions: extensions,
    disableDefaultContainer: true,
    onCreate: ({ editor }) => {
      // Prefer the live snapshot (captures content typed before the debounce
      // fires) over the slower debounced doc state so tab switches never lose
      // in-progress content.
      const content = latestContentRef.current ?? doc?.content;
      if (content) {
        editor.commands.setContent(content);
        lastContentRef.current = editor.getHTML();
      }
    },
    onUpdate: ({ editor }) => {
      if (!editableRef.current) return;
      const currentHTML = editor.getHTML();
      if (currentHTML === lastContentRef.current) return;

      lastContentRef.current = currentHTML;
      latestContentRef.current = editor.getJSON();

      debouncedUpdates({
        updatedDoc: {
          ...doc,
          content: editor.getJSON(),
          updatedAt: new Date().toISOString(),
        },
        characterCount: {
          characters: editor.state.doc.textContent.length,
          words: editor.state.doc.textContent.match(/\w+/g)?.length ?? 0,
        },
        ydocBase64: yDoc ? encodeYDocToBase64(yDoc) : undefined,
      });
    },
  };

  return { editorOptions };
}
