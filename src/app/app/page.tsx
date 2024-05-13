"use client";

import React, { useEffect, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../components/editor/extensions/extension-kit';
import { useUser } from '@clerk/nextjs';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Collaboration from '@tiptap/extension-collaboration';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import { useDebouncedCallback } from 'use-debounce';

export default function App() {
  const { user } = useUser();
  // const { editor, characterCount } = useBlockEditor();

  const [yDoc, setYDoc] = useState<Y.Doc>()
  const [saveStatus, setSaveStatus] = useState("Saved")
  const [collabProvider, setCollabProvider] = useState<TiptapCollabProvider>()

  const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16)
  }

  const userColor = `#${randomColor()}`

  const doc = new Y.Doc()

  const debouncedUpdates = useDebouncedCallback(() => {
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
  }, 1000);

  useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: "page-doc",
      appId: String(process.env.NEXT_PUBLIC_TIPTAP_CLOUD_APP_ID),
      token: String(process.env.NEXT_PUBLIC_TIPTAP_CLOUD_TOKEN),
      document: doc,
    })

    return () => {
      provider.destroy()
    }
  }, [])

  const editor = useEditor({
    autofocus: 'end',
    extensions: [
      ...ExtensionKit(),
      Collaboration.configure({
        document: doc,
      }),
      // CollaborationCursor.configure({
      //   collabProvider,
      //   user: {
      //     name: 'Cyndi Lauper',
      //     color: '#f783ac',
      //   },
      // }),
    ],
  });

  if (!editor) {
    return null
  }

  editor.on('update', () => {
    setSaveStatus("Saving...");
    debouncedUpdates()
  })

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar words={editor?.storage?.characterCount.words()} characters={editor?.storage?.characterCount.characters()} status={saveStatus} />

      <div
        // onClick={() => { editor?.chain().focus().run(); }}
        className="relative w-full flex min-h-screen cursor-text flex-col items-center p-6"
      >
        <div className="relative w-full max-w-screen-lg flex flex-col gap-2">
          <h1 className="text-6xl font-bold">
            Welcome to Drafts!
          </h1>

          <ContentItemMenu editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}