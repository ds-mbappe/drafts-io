"use client";

import React, { useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../components/editor/extensions/extension-kit';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import { useDebouncedCallback } from 'use-debounce';
import Sidebar from '@/components/pannels/Sidebar';
import { useBlockEditor } from '@/components/editor/hooks/useBlockEditor';

export default function App() {
  const { leftSidebar } = useBlockEditor();
  const [saveStatus, setSaveStatus] = useState("Saved")

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(() => {
    setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
  }, 1000);

  const editor = useEditor({
    autofocus: 'end',
    extensions: [
      ...ExtensionKit(),
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
      <Navbar
        status={saveStatus}
        isSidebarOpen={leftSidebar.isOpen}
        toggleSidebar={leftSidebar.toggle}
        words={editor?.storage?.characterCount.words()}
        characters={editor?.storage?.characterCount.characters()}
      />

      <div className="flex h-full">
        <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} />

        <div
          // onClick={() => { editor?.chain().focus().run(); }}
          className="relative flex-1 flex min-h-screen cursor-text flex-col items-center p-6"
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
    </div>
  )
}