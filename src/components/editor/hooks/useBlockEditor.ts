import { Editor, useEditor } from '@tiptap/react'
import { ExtensionKit } from '../extensions/extension-kit';

declare global {
  interface Window {
    editor: Editor | null
  }
}

export const useBlockEditor = () => {
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
  })

  const characterCount = editor?.storage.characterCount || { characters: () => 0, words: () => 0 }

  window.editor = editor

  return { editor, characterCount }
}