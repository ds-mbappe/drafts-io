"use client";

import React, { useEffect, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../components/editor/extensions/extension-kit';
import { useBlockEditor } from "../../components/editor/hooks/useBlockEditor";
import { useUser } from '@clerk/nextjs';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Collaboration from '@tiptap/extension-collaboration';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

export default function App() {
  const { user } = useUser();
  const { editor, characterCount }: any = useBlockEditor();

  // const doc = new Y.Doc()
  
  // new IndexeddbPersistence('collab-test-document', doc)

  const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16)
  }

  const userColor = `#${randomColor()}`

  // const provider = new TiptapCollabProvider({
  //   name: "collab-test-document",
  //   appId: 'j9yvq891',
  //   token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTMyMTQyNTIsIm5iZiI6MTcxMzIxNDI1MiwiZXhwIjoxNzEzMzAwNjUyLCJpc3MiOiJodHRwczovL2Nsb3VkLnRpcHRhcC5kZXYiLCJhdWQiOiJqOXl2cTg5MSJ9.g4rCB3X_EzQZ8nBNpfmP22PAK6VBy8HgSGfEUR6yCFs',
  //   document: doc,

  //   onSynced() {
  //     if (!doc.getMap('config').get('initialContentLoaded') && defaultEditor) {
  //       doc.getMap('config').set('initialContentLoaded', true);

  //       editor.commands.setContent('')
  //     }
  //   }
  // })
  // provider.setAwarenessField("user", {
  //   name: user?.fullName,
  //   color: userColor,
  // });

  const defaultEditor = useEditor({
    extensions: [
      ...ExtensionKit(),
      // Collaboration.configure({
      //   document: doc,
      // }),
      // CollaborationCursor.configure({
      //   provider,
      //   user: {
      //     name: user?.fullName,
      //     color: userColor,
      //   },
      // }),
    ],
  });

  // document.addEventListener("mousemove", (event) => {
  //   provider.setAwarenessField("user", {
  //     name: user?.fullName,
  //     color: userColor,
  //     mouseX: event.clientX,
  //     mouseY: event.clientY,
  //   });
  // });

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar words={characterCount.words()} characters={characterCount.characters()} />

      <div
        onClick={() => { editor?.chain().focus().run(); }}
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

          <EditorContent editor={defaultEditor} />
        </div>
      </div>
    </div>
  )
}