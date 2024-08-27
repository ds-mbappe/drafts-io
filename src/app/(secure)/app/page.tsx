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
  const mockData = [
    {
      _id: "1",
      private: true,
      locked: undefined,
      creator: {
        email: "johndoe@example.com",
        avatar: "https://images.unsplash.com/photo-1504596402847-5ff01e5b8d92",
        fullname: "John Doe"
      },
      created_at: "2024-01-15T10:20:30Z",
      updated_at: "2024-02-15T12:30:45Z",
      cover: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      topic: "Technology",
      title: "The Future of AI",
      caption: "Exploring the rapid advancements in artificial intelligence and what it means for various industries and the future of work.",
      content: "AI has become a driving force in technological innovation..."
    },
    {
      _id: "2",
      private: false,
      locked: undefined,
      creator: {
        email: "janedoe@example.com",
        avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
        fullname: "Jane Doe"
      },
      created_at: "2023-11-22T08:15:10Z",
      updated_at: "2024-01-02T09:45:30Z",
      cover: "https://images.unsplash.com/photo-1554224154-22dec7ec8818",
      topic: "Health",
      title: "Benefits of a Plant-Based Diet",
      caption: "Discover the various health benefits of adopting a plant-based diet, including weight loss, improved heart health, and reduced risk of chronic diseases.",
      content: "A plant-based diet can lead to numerous health improvements..."
    },
    {
      _id: "3",
      private: true,
      locked: true,
      creator: {
        email: "marksmith@example.com",
        avatar: "https://images.unsplash.com/photo-1502764613149-7f1d229e2300",
        fullname: "Mark Smith"
      },
      created_at: "2024-03-10T14:40:20Z",
      updated_at: "2024-03-15T16:50:35Z",
      cover: "https://images.unsplash.com/photo-1575320181282-7b33a34b61af",
      topic: "Politics",
      title: "Elections Around the World",
      caption: "An in-depth analysis of the most recent global elections, the impact on international relations, and future political landscapes.",
      content: "The recent elections have sparked significant discussions..."
    },
    {
      _id: "4",
      private: false,
      locked: undefined,
      creator: {
        email: "emilybrown@example.com",
        avatar: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
        fullname: "Emily Brown"
      },
      created_at: "2024-02-05T07:25:10Z",
      updated_at: "2024-02-20T11:10:50Z",
      cover: "https://images.unsplash.com/photo-1542064747-8f0fffbdbcaf",
      topic: "Environment",
      title: "The Beauty of National Parks",
      caption: "Explore the stunning landscapes and unique ecosystems found in national parks across the globe, and the importance of their conservation.",
      content: "National parks are a testament to nature's splendor..."
    },
    {
      _id: "5",
      private: true,
      locked: true,
      creator: {
        email: "daniellee@example.com",
        avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7",
        fullname: "Daniel Lee"
      },
      created_at: "2023-12-01T11:35:50Z",
      updated_at: "2024-01-12T13:50:20Z",
      cover: "https://images.unsplash.com/photo-1565529531-1b5335cebaef",
      topic: "Business",
      title: "Stock Market Predictions",
      caption: "Analyzing the latest trends in the stock market and offering predictions for the upcoming fiscal year based on current economic indicators.",
      content: "The stock market is a dynamic and unpredictable entity..."
    },
    {
      _id: "6",
      private: false,
      locked: undefined,
      creator: {
        email: "lucasmartin@example.com",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        fullname: "Lucas Martin"
      },
      created_at: "2024-04-01T09:50:15Z",
      updated_at: "2024-04-15T12:25:30Z",
      cover: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
      topic: "Entertainment",
      title: "The Evolution of Cinema",
      caption: "From silent films to modern blockbusters, explore how cinema has evolved over the decades and its influence on culture and society.",
      content: "Cinema has been a powerful medium of storytelling..."
    },
    {
      _id: "7",
      private: true,
      locked: undefined,
      creator: {
        email: "sarahjones@example.com",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        fullname: "Sarah Jones"
      },
      created_at: "2024-02-20T06:30:40Z",
      updated_at: "2024-03-01T08:15:50Z",
      cover: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
      topic: "Lifestyle",
      title: "How to Stay Fit",
      caption: "Learn the most effective ways to maintain your fitness goals throughout the year, including workout routines, diet tips, and motivation strategies.",
      content: "Staying fit requires dedication and a well-structured plan..."
    },
    {
      _id: "8",
      private: false,
      locked: true,
      creator: {
        email: "michaelwong@example.com",
        avatar: "https://images.unsplash.com/photo-1603415526960-06e630b7f91d",
        fullname: "Michael Wong"
      },
      created_at: "2023-10-18T17:20:35Z",
      updated_at: "2023-11-22T19:45:55Z",
      cover: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
      topic: "Culture",
      title: "Preserving Indigenous Cultures",
      caption: "A deep dive into the efforts being made to preserve indigenous cultures, languages, and traditions in a rapidly changing world.",
      content: "Indigenous cultures are an invaluable part of our global heritage..."
    },
    {
      _id: "9",
      private: true,
      locked: undefined,
      creator: {
        email: "oliverjohnson@example.com",
        avatar: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6",
        fullname: "Oliver Johnson"
      },
      created_at: "2024-03-25T13:05:20Z",
      updated_at: "2024-04-01T15:10:40Z",
      cover: "https://images.unsplash.com/photo-1607435098695-5ef3b0c054b9",
      topic: "Science",
      title: "The Quest for Mars",
      caption: "Exploring the ongoing missions and scientific endeavors aimed at making human life possible on Mars within the next few decades.",
      content: "Mars has been the subject of fascination and exploration for years..."
    },
    {
      _id: "10",
      private: false,
      locked: undefined,
      creator: {
        email: "emmadavis@example.com",
        avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4",
        fullname: "Emma Davis"
      },
      created_at: "2023-09-30T10:40:25Z",
      updated_at: "2023-10-15T12:55:45Z",
      cover: "https://images.unsplash.com/photo-1564936283125-1a964b6797f1",
      topic: "Food & Drink",
      title: "The World of Culinary Arts",
      caption: "Discover the rich history and evolution of culinary arts, including key influences from different cultures and the rise of global food trends.",
      content: "Culinary arts have been an integral part of human culture..."
    }
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
        <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} />

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
            <Tab key="foryou" title={"Latest"} className="flex flex-col gap-4">
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