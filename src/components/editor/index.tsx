"use client";

import { EditorContent, PureEditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import React, { useRef, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { Button } from "../ui/button";

export default function BlockEditor() {
  const { editor, characterCount } = useBlockEditor();
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);

  return (
    <div className="w-full h-full flex flex-col">
      <Navbar words={characterCount.words()} characters={characterCount.characters()} />
      
      <div
        onClick={() => { editor?.chain().focus().run(); }}
        className="relative flex w-full min-h-screen cursor-text flex-col items-center p-6"
      >
        <div className="relative w-full max-w-screen-lg">
          <Button>Save</Button>
          <EditorContent editor={editor} ref={editorRef} className="flex-1 overflow-y-auto" />
        </div>
      </div>
    </div>
  );
}