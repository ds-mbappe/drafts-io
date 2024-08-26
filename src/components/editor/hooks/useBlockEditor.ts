import type { Doc as YDoc } from 'yjs';
import { useSidebar } from './useSidebar';
import { useEditor } from '@tiptap/react';
import { useMemo, useState } from 'react';
import type { AnyExtension } from '@tiptap/core';
import { ExtensionKit } from '../extensions/extension-kit';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import CollaborationHistory from '@tiptap-pro/extension-collaboration-history';

// declare global {
//   interface Window {
//     editor: Editor | null
//   }
// }

export const useBlockEditor = ({
  yDoc,
  provider,
  updateHistoryData,
  setSaveStatus,
  userFullName,
  updateStatusAndCount,
  debouncedUpdates,
  UpdateHistoryVersions,
}: {
  yDoc: YDoc | null | undefined,
  provider?: TiptapCollabProvider | undefined,
  updateHistoryData: Function,
  setSaveStatus: Function,
  userFullName: String,
  updateStatusAndCount: Function,
  debouncedUpdates: Function,
  UpdateHistoryVersions: Function,
}) => {
  const [hasChanges, setHasChanges] = useState(false);

  const leftSidebar = useSidebar()

  const initialContent = "<p>Drafts is a notes taking app with really cool features ! Try and hit the '/' key or try the markdown shortcuts, which make it easy to format the text while typing.</p><p>Consider this page as your 'playground'; here you can test all features and when you're done, you can go ahead and tap the burger menu to your left to create new documents, or import existing ones.</p><p>To test that, start a new line and type # followed by a space to get aheading. Try #, ##, ###, ####, #####, ###### for different levels. Those conventions are called input rules in tiptap. Some of them are enabled by default. Try '>' for blockquotes, *, - or + for bullet lists, or ~~tildes~~ to strike text. These are some of the multiple 'cheat codes' you can have, but we'll let you explore to find out all of them.</p><p>Happy texting !</p>"

  const onUpdate = () => {
    setHasChanges(true)
  }

  const onSynced = () => {
    yDoc?.on('update', onUpdate)
  }

  const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16)
  }

  const userColor = useMemo(() => {
    return `#${randomColor()}`
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: true,
    onCreate: ({ editor }) => {
      provider?.on('synced', () => {
        onSynced();
        const tiptap = document.querySelector(".tiptap")
        if (tiptap) {
          tiptap.setAttribute('style', `cursor: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 96 104" xmlns="http://www.w3.org/2000/svg"><path style="fill: black" d="M0.86065 0.697766L95.7812 51.5907L50.3553 59.6832L34.4976 103.014L0.86065 0.697766Z" /></svg>'), default; !important`)
        }
      })
      provider?.on('authenticationFailed', ({ reason }: any) => {
        setSaveStatus("Not Synced");
        console.log("The authentication has failed: ", reason);
      })
      provider?.on("disconnect", () => {
        setSaveStatus("Not Synced");
      });
    },
    extensions: [
      ...ExtensionKit(),
      provider
        ? Collaboration.configure({
          document: yDoc,
        })
        : undefined,
      provider
        ? CollaborationCursor.configure({
          provider,
          user: {
            name: null,
            color: userColor,
          },
        })
        : undefined,
      provider
        ? CollaborationHistory.configure({
          provider,
          onUpdate(payload) {
            updateHistoryData(payload)
          },
        })
        : undefined
    ].filter((e): e is AnyExtension => e !== undefined),
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
      },
    },
  }, [yDoc, provider])

  editor?.on('update', (e: any) => {
    updateStatusAndCount(editor?.storage.characterCount)
    setSaveStatus("Syncing...");
    debouncedUpdates(e);
    UpdateHistoryVersions()
  })

  const characterCount = editor?.storage.characterCount || { characters: () => 0, words: () => 0 }

  // window.editor = editor

  return { editor, characterCount, leftSidebar, initialContent }
}