"use client";

import React, { useRef, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../components/editor/extensions/extension-kit';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import { useDebouncedCallback } from 'use-debounce';
import Sidebar from '@/components/pannels/Sidebar';
import History from '@tiptap/extension-history';
import { useSidebar } from '@/components/editor/hooks/useSidebar';
import 'katex/dist/katex.min.css';
import { LinkMenu } from '../../components/editor/menus/LinkMenu'
import TextMenu from '@/components/editor/menus/TextMenu/TextMenu';

export default function App() {
  const leftSidebar = useSidebar();
  const menuContainerRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState("Synced")

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(() => {
    setTimeout(() => {
      setSaveStatus("Synced");
    }, 500);
  }, 1000);

  const editor = useEditor({
    autofocus: 'end',
    extensions: [
      ...ExtensionKit(),
      History,
    ],
  });

  if (!editor) return

  editor.on('update', () => {
    setSaveStatus("Syncing...");
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

        <div className="relative flex min-h-screen cursor-text flex-col items-center z-[1] flex-1 p-0 lg:p-6">
          <div className="relative w-full max-w-screen-xl flex flex-col gap-2" ref={menuContainerRef}>
            {/* <h1 className="text-6xl font-bold">
              Welcome to Drafts!
            </h1> */}

            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} />
            <EditorContent editor={editor} spellCheck={"false"} />
          </div>
        </div>
      </div>
    </div>
  )
}