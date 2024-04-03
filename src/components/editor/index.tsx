"use client";

import { EditorContent, PureEditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import React, { useRef } from 'react';

export default function BlockEditor() {
  const { editor } = useBlockEditor();
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);

  return (
    <div
      onClick={() => { editor?.chain().focus().run(); }}
      className="relative flex w-full min-h-screen cursor-text flex-col items-center p-6"
    >
      <div className="relative w-full max-w-screen-lg">
        <EditorContent editor={editor} ref={editorRef} className="flex-1 overflow-y-auto" />
      </div>
    </div>
  );
}