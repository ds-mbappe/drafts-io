"use client";

import React, { useEffect, useRef, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../../../components/editor/extensions/extension-kit';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import { useDebouncedCallback } from 'use-debounce';
import Sidebar from '@/components/pannels/Sidebar';
import { useSidebar } from '@/components/editor/hooks/useSidebar';
import 'katex/dist/katex.min.css';
import { LinkMenu } from '../../../../components/editor/menus/LinkMenu'
import TextMenu from '@/components/editor/menus/TextMenu/TextMenu';
import TableRowMenu from '@/components/editor/extensions/Table/menus/TableRow/TableRow';
import TableColumnMenu from '@/components/editor/extensions/Table/menus/TableColumn/TableColumn';
import ImageBlockMenu from '@/components/editor/extensions/ImageBlock/components/ImageBlockMenu';
import History from '@tiptap/extension-history';
import { Button } from '@nextui-org/react';

const NewDocument = () => {
  const leftSidebar = useSidebar();
  const menuContainerRef = useRef(null);
  const [user, setUser] = useState<any>();
  const [saveStatus, setSaveStatus] = useState("Synced");

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(async() => {
    let formData = {
      id: user?._id,
      draft: editor?.getHTML(),
    }

    const response = await fetch(`/api/user/${user?.email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    });

    if (response?.ok) {
      setSaveStatus("Synced");
    }
  }, 1000);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: 'end',
    extensions: [
      ...ExtensionKit(),
      History,
    ],
  });

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`/api/user/${user?.email}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setUser(data)
      editor?.commands.setContent(data?.draft)
    }

    fetchUser();
  }, [user?.draft])

  if (!editor) return

  editor.on('update', () => {
    setSaveStatus("Syncing...");
    debouncedUpdates()
  })

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar
        status={saveStatus}
        isSidebarOpen={leftSidebar.isOpen}
        toggleSidebar={leftSidebar.toggle}
      />

      <div className="flex flex-1 h-full bg-content1">
        <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} />

        <div className="w-full relative flex overflow-y-auto cursor-text flex-col items-center z-[1] flex-1 p-0 lg:p-6">
          <div className="relative w-full max-w-screen-xl flex flex-col gap-2" ref={menuContainerRef}>
            <EditorContent editor={editor} spellCheck={"false"} />
            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} />
            <TableRowMenu editor={editor} appendTo={menuContainerRef} />
            <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
            <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
          </div>
        </div>
      </div>

      <Button
        variant="shadow"
        radius="full"
        color="primary"
        className="fixed bottom-4 right-4 z-[99]"
      >
        {'Upload document'}
      </Button>
    </div>
  )
}

export default NewDocument