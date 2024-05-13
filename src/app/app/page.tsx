"use client";

import React, { useEffect, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../components/editor/extensions/extension-kit';
import { useUser } from '@clerk/nextjs';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Collaboration from '@tiptap/extension-collaboration';
import { HocuspocusProvider, TiptapCollabProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket'
import OpenAI from "openai"
import { Button } from '@/components/ui/button';
import { useBlockEditor } from '@/components/editor/hooks/useBlockEditor';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import { useDebouncedCallback } from 'use-debounce';

export default function App() {
  const { user } = useUser();
  const { editor, characterCount } = useBlockEditor();

  const [yDoc, setYDoc] = useState<Y.Doc>()
  const [saveStatus, setSaveStatus] = useState("Saved")
  const [collabProvider, setCollabProvider] = useState<TiptapCollabProvider>()

  const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16)
  }

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const userColor = `#${randomColor()}`

  const generatePrompt = async () => {
    // editor?.view.state.selection.$head.parent

    // const completion = await openai.chat.completions.create({
    //   messages: [
    //     {
    //       role: "system",
    //       content: "You are a generative content editor."
    //     },
    //     {
    //       role: "system",
    //       content: "You can construct entire content about almost anything the user asks you. Your particulary is that you use different html tags to wrap your answers. You can also emphasize some parts of your answers using attricutes like <strong>, <em> and <i> (the list is non exhaustive); you can also integrate tags to color some text in your answers. You can integrate whatever html tag you seem appropriate as long as you think it helps."
    //     },
    //     {
    //       role: "system",
    //       content: "You cannot use the p tag"
    //     },
    //     {
    //       role: "system",
    //       content: "You can use the following tags to structure your content: h1 to h6 tags (headings), strong (emphasize), em (italic), i (italic), u (underline), br (to go to next line), ul, ol, li (for lists), hr (for separators). This list is non exhaustive, so you can add in any tag you think appropriate (except for the p tag)"
    //     },
    //     {
    //       role: "system",
    //       content: "You cannot use the p tag"
    //     },
    //     {
    //       role: "user",
    //       content: "Write 2 paragraphs about a topic of your choice."
    //     },
    //   ],
    //   model: "gpt-3.5-turbo"
    // })
    // console.log(completion.choices[0]?.message?.content)
  }

  const debouncedUpdates = useDebouncedCallback(() => {
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
  }, 1000);

  useEffect(() => {
    editor?.commands.updateUser({
      name: user?.fullName,
      color: userColor,
      avatar: user?.imageUrl
    })

    // const doc = new Y.Doc()
    // const provider = new TiptapCollabProvider({
    //   name: "new-doc",
    //   appId: process.env.NEXT_TIPTAP_CLOUD_APP_ID,
    //   token: process.env.NEXT_TIPTAP_CLOUD_TOKEN,
    //   document: doc,
  
    //   onSynced() {
    //     if (!doc.getMap('config').get('initialContentLoaded') && editor) {
    //       doc.getMap('config').set('initialContentLoaded', true);
    //     }
    //   }
    // })
  }, [])


  // const doc = new Y.Doc()
  // const provider = new WebsocketProvider(
  //   "ws://localhost:1234",
  //   "room",
  //   doc
  // )

  //   provider?.setAwarenessField("user", {
  //     name: user?.fullName,
  //     color: userColor,
  //   });

  // useEffect(() => {
  //   provider?.on('status', (event: any) => {
  //     console.log(event.status)
  //   })
  // }, [])

  // useEffect(() => {
  //   document.addEventListener("mousemove", (event) => {
  //     provider.setAwarenessField("user", {
  //       name: user?.fullName,
  //       color: userColor,
  //       mouseX: event.clientX,
  //       mouseY: event.clientY,
  //     });
  //   });
  // }, [])

  // const editor = useEditor({
  //   autofocus: 'end',
  //   extensions: [
  //     ...ExtensionKit(),
  //     // Collaboration.configure({
  //     //   document: doc,
  //     // }),
  //     // CollaborationCursor.configure({
  //     //   provider
  //     // }),
  //   ],
  // });

  if (!editor) {
    return null
  }

  editor.on('update', () => {
    setSaveStatus("Saving...");
    debouncedUpdates()
  })

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar words={characterCount.words()} characters={characterCount.characters()} status={saveStatus} />

      <div
        // onClick={() => { editor?.chain().focus().run(); }}
        className="relative w-full flex min-h-screen cursor-text flex-col items-start p-6"
      >
        <div className="relative w-full max-w-screen-lg flex flex-col justify-center items-center gap-2">
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