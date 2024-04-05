"use client";

import { EditorContent, PureEditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import React, { useRef, useEffect, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { Button } from "../ui/button";
import { useUser } from '@clerk/clerk-react';

export default function BlockEditor() {
  const { user } = useUser();
  const { editor, characterCount } = useBlockEditor();
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);

  const fetchDocuments = async () => {
    try {
      const docs = await fetch(`/api/documents/${user?.id}`, {
        method: 'GET',
        "content-type": "application/json",
      });
    } catch (error) {
      console.log(error);
    }
  }

  // useEffect(() => {
  //   if (user?.id) {
  //     fetchDocuments();
  //   }
  // });

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