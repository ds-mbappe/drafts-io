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

export default function App() {
  const { user } = useUser();

  const [yDoc, setYDoc] = useState<Y.Doc>()
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
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a generative content editor."
        },
        {
          role: "system",
          content: "You can construct entire content about almost anything the user asks you. Your particulary is that you use different html tags to wrap your answers. You can also emphasize some parts of your answers using attricutes like <strong>, <em> and <i> (the list is non exhaustive); you can also integrate tags to color some text in your answers. You can integrate whatever html tag you seem appropriate as long as you think it helps."
        },
        {
          role: "system",
          content: "You cannot use the p tag"
        },
        {
          role: "system",
          content: "You can use the following tags to structure your content: h1 to h6 tags (headings), strong (emphasize), em (italic), i (italic), u (underline), br (to go to next line), ul, ol, li (for lists), hr (for separators). This list is non exhaustive, so you can add in any tag you think appropriate (except for the p tag)"
        },
        {
          role: "system",
          content: "You cannot use the p tag"
        },
        {
          role: "user",
          content: "Write a content about any topic of you choice, and use the maximum number of tokens you can"
        },
      ],
      model: "gpt-3.5-turbo"
    })
    // console.log(completion.choices[0]?.message?.content)
  }

  useEffect(() => {
    defaultEditor?.commands.updateUser({
      name: user?.fullName,
      color: userColor,
      avatar: user?.imageUrl
    })

    // const doc = new Y.Doc()
    // const provider = new TiptapCollabProvider({
    //   name: "new-doc",
    //   appId: 'j9yvq891',
    //   token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTMyMTQyNTIsIm5iZiI6MTcxMzIxNDI1MiwiZXhwIjoxNzEzMzAwNjUyLCJpc3MiOiJodHRwczovL2Nsb3VkLnRpcHRhcC5kZXYiLCJhdWQiOiJqOXl2cTg5MSJ9.g4rCB3X_EzQZ8nBNpfmP22PAK6VBy8HgSGfEUR6yCFs',
    //   document: doc,
  
    //   onSynced() {
    //     if (!doc.getMap('config').get('initialContentLoaded') && defaultEditor) {
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

  const defaultEditor = useEditor({
    extensions: [
      ...ExtensionKit(),
      // Collaboration.configure({
      //   document: doc,
      // }),
      // CollaborationCursor.configure({
      //   provider
      // }),
    ],
  });

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar words={defaultEditor?.storage.characterCount.words()} characters={defaultEditor?.storage.characterCount.characters()} />

      <div
        // onClick={() => { defaultEditor?.chain().focus().run(); }}
        className="relative w-full flex min-h-screen cursor-text flex-col items-start p-6"
      >
        <div className="relative w-full max-w-screen-lg">
          <h1 className="mb-4 text-6xl font-bold">
            Welcome to the GOAT awesome Editor!
          </h1>

          <p className="mb-2">
            Check out the features below or create a new document to get started.
            You can either use the {"/"} command or try the markdown shortcuts,
            which make it easy to format the text while typing.
          </p>

          <p className="mb-2">
            To test that, start a new line and type # followed by a space to get a
            heading. Try #, ##, ###, ####, #####, ###### for different levels.
            Those conventions are called input rules in tiptap. Some of them are
            enabled by default. Try {">"} for blockquotes, *, - or + for bullet
            lists, `foobar` to highlight code or ~~tildes~~ to strike text.
          </p>

          {/* <Button onClick={generatePrompt}>
            Generate
          </Button> */}

          <EditorContent editor={defaultEditor} />
        </div>
      </div>
    </div>
  )
}