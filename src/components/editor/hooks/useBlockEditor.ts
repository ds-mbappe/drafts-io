import { Editor, useEditor } from '@tiptap/react'
import { ExtensionKit } from '../extensions/extension-kit';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    editor: Editor | null
  }
}

export const useBlockEditor = () => {
  // const [characterCount, setCharacterCount] = useState(null);

  const editor = useEditor({
    content: "<p>Hello World! 🌎️</p>",
    autofocus: true,
    extensions: [
      ...ExtensionKit(),
    ],
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
      },
    },
  });

  // useEffect(() => {
  //   editor?.on('update', ({ editor }) => {
  //     setCharacterCount(editor.storage.characterCount || { characters: () => 0, words: () => 0 })
  //   });
  // })

  const characterCount = editor?.storage.characterCount || { characters: () => 0, words: () => 0 }

  window.editor = editor

  return { editor, characterCount }
}