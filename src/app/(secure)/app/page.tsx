"use client";

import React, { useEffect, useRef, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { EditorContent, useEditor } from "@tiptap/react";
import { ExtensionKit } from '../../../components/editor/extensions/extension-kit';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import { useDebouncedCallback } from 'use-debounce';
import Sidebar from '@/components/pannels/Sidebar';
import History from '@tiptap/extension-history';
import { useSidebar } from '@/components/editor/hooks/useSidebar';
import 'katex/dist/katex.min.css';
import { LinkMenu } from '../../../components/editor/menus/LinkMenu'
import TextMenu from '@/components/editor/menus/TextMenu/TextMenu';
import TableRowMenu from '@/components/editor/extensions/Table/menus/TableRow/TableRow';
import TableColumnMenu from '@/components/editor/extensions/Table/menus/TableColumn/TableColumn';
import { Button, Input, Chip, Tabs, Tab } from "@nextui-org/react";
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { CircleArrowRightIcon } from 'lucide-react';
import DocumentCard from '@/components/card/DocumentCard';
import { toast } from "sonner";

export default function App() {
  const leftSidebar = useSidebar();
  const menuContainerRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState("Synced")
  const [latestDocuments, setLatestDocuments] = useState([])
  const topics = [
    "World News",
    "Politics",
    "Business",
    "Technology",
    "Science",
    "Health",
    "Entertainment",
    "Sports",
    "Travel",
    "Lifestyle",
    "Environment",
    "Education",
    "Food & Drink",
    "Culture",
    "Fashion",
    "Finance",
    "Real Estate",
    "Automotive",
    "Gaming",
    "Opinion"
  ]

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(() => {
    setTimeout(() => {
      setSaveStatus("Synced");
    }, 500);
  }, 1000);

  // Editor instance
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: 'end',
    onCreate: ({ editor }) => {
      // editor.commands.setContent(initialContent)
      // editor.commands.focus('start', { scrollIntoView: true })
    },
    onUpdate: ({ editor }) => {
      setSaveStatus("Syncing...");
      debouncedUpdates()
    },
    extensions: [
      ...ExtensionKit(),
      History,
    ],
  });

  useEffect(() => {
    const fetchLatestDocuments = async() => {
      const res = await fetch("/api/documents", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(`Error`, {
          description: `Error fetching documents, please verify your network and try again.`,
          duration: 5000,
          important: true,
        })
      }

      setLatestDocuments(data?.documents);
    }

    fetchLatestDocuments();
  }, [])

  if (!editor) return

  return (
    <div className="w-full h-screen flex flex-col pb-[64px]">
      <Navbar
        status={saveStatus}
        isSidebarOpen={leftSidebar.isOpen}
        toggleSidebar={leftSidebar.toggle}
        words={editor?.storage?.characterCount.words()}
        characters={editor?.storage?.characterCount.characters()}
      />

      <div className="flex flex-1 h-full bg-content1">
        <Sidebar
          isOpen={leftSidebar.isOpen}
          onClose={leftSidebar.close}
        />

        {/* <div className="w-full relative flex overflow-y-auto cursor-text flex-col items-center z-[1] flex-1 p-0 lg:p-6">
          <div className="relative w-full max-w-screen-xl flex flex-col gap-2" ref={menuContainerRef}>
            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TableRowMenu editor={editor} appendTo={menuContainerRef} />
            <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} />
            <EditorContent editor={editor} spellCheck={"false"} />
          </div>
        </div> */}
        <div className="w-full max-w-[1024px] mx-auto relative flex overflow-y-auto cursor-text flex-col gap-4 z-[1] flex-1 px-5 2xl:!px-0 pt-8 pb-5">
          <Input
            type="text"
            placeholder="Search"
            variant="bordered"
            className="w-full md:!w-3/4"
            startContent={<MagnifyingGlassIcon className="w-6 h-6" />}
            isClearable
          />

          <Tabs
            key="tabs"
            color="primary"
            variant="underlined"
            aria-label="Tabs"
            fullWidth
            classNames={{
              tabList: "w-full p-0 border-b border-divider",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab key="latest" title={"Latest"} className="flex flex-col gap-4">
              {
                latestDocuments?.map((document, index) => {
                  return <DocumentCard key={index} document={document} />
                })
              }
            </Tab>

            {
              topics?.map((topic, index) => {
                return (
                  <Tab key={index} title={topic}>

                  </Tab>
                )
              })
            }
          </Tabs>
        </div>
      </div>
    </div>
  )
}