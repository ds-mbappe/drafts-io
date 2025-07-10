import { useEditor } from '@tiptap/react';
import History from '@tiptap/extension-history';
import { ExtensionKit } from '../extensions/extension-kit';
import { useCallback, useMemo } from 'react';

export const useBlockEditor = ({
  doc,
  editable,
  autoFocus,
  debouncedUpdates,
}: {
  doc?: any,
  editable: boolean,
  autoFocus: boolean,
  debouncedUpdates: Function,
}) => {
  const extensions = useMemo(() => [
    ...ExtensionKit(),
    History,
  ], []);

  const handleUpdate = useCallback((e: any) => {
    debouncedUpdates(e);
  }, [debouncedUpdates]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: autoFocus,
    editable: editable,
    onCreate: ({ editor }) => {
      editor.commands.setContent(doc?.content || '')
    },
    extensions,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
    },
  }, [editable ? null : doc]);

  const characterCount = editor?.storage.characterCount || { characters: () => 0, words: () => 0 }

  return { editor, characterCount }
}