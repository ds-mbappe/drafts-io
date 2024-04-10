"use client";

import React from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../components/editor/extensions/extension-kit';
import { useBlockEditor } from "../../components/editor/hooks/useBlockEditor";

export default function App() {
  const { editor, characterCount }: any = useBlockEditor();

  const defaultEditor = useEditor({
    extensions: [...ExtensionKit()],
    content: "",
  });

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