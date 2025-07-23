import { useEditor } from '@tiptap/react';
import History from '@tiptap/extension-history';
import { ExtensionKit } from '../extensions/extension-kit';
import { useMemo } from 'react';
import { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"
import Collaboration from "@tiptap/extension-collaboration"

export const useBlockEditor = ({
  doc,
  yDoc,
  provider,
  editable,
  autoFocus,
  debouncedUpdates,
}: {
  doc?: any,
  yDoc?: Y.Doc,
  editable: boolean
  autoFocus: boolean
  debouncedUpdates: Function
  provider?: WebsocketProvider | null
}) => {
  // Build extensions after provider is ready
  const extensions = useMemo(() => {
    if (!provider) return [...ExtensionKit()]
    
    return [
      ...ExtensionKit(),
      History,
      Collaboration.configure({ 
        document: yDoc,
        field: 'default'
      }),
    ]
  }, [provider, yDoc])

  // Initialize editor
  const editor = useEditor({
    extensions,
    autofocus: autoFocus,
    editable,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
    },
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      if (doc?.content) {
        editor.commands.setContent(doc.content)
      }
    },
    onUpdate: ({ editor }) => {
      const updatedDoc = {
        ...doc,
        content: editor.getHTML(),
        updatedAt: new Date().toISOString(),
      }
      debouncedUpdates({
        updatedDoc,
        characterCount: editor.storage.characterCount,
      })
    },
  })

  const characterCount = editor?.storage.characterCount || {
    characters: () => 0,
    words: () => 0,
  }

  return { 
    editor, 
    characterCount,
  }
}