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
import { Button, Input, Chip, Tabs, Tab, Skeleton, Spinner } from "@nextui-org/react";
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { CircleArrowRightIcon, CirclePlusIcon } from 'lucide-react';
import DocumentCard from '@/components/card/DocumentCard';
import { toast } from "sonner";
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();
  const leftSidebar = useSidebar();
  const menuContainerRef = useRef(null);
  const [user, setUser] = useState<any>()
  const [loading, setIsLoading] = useState(false)
  const [loadingLatest, setIsLoadingLatest] = useState(false)
  const [documents, setDocuments] = useState([])
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

  // Fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    const data = await fetch(`/api/documents/${user?.email}`, {
      method: 'GET',
      headers: { "content-type": "application/json" },
    });
    
    if (data?.ok) {
      const realDocs = await data.json();
      setDocuments(realDocs.documents)
    } else {
      toast.error(`Error`, {
        description: `Error fetching documents, please try again!`,
        duration: 5000,
        important: true,
      })
    }
    setIsLoading(false)
  }

  // Search
  const filterDocuments = useDebouncedCallback(async(e: any) => {
    let dataPersonal = documents

    dataPersonal = dataPersonal.filter((doc: any) => doc?.name?.toLowerCase()?.startsWith(e.target.value))

    const res = await fetch(`/api/documents?search=${e?.target?.value}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
  }, 300)

  const goToNewDocument = () => {
    router.push("/app/new-doc")
  }

  useEffect(() => {
    const fetchLatestDocuments = async() => {
      setIsLoadingLatest(true)
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
      } else {
        setLatestDocuments(data?.documents);
      }
      setIsLoadingLatest(false)
    }

    fetchLatestDocuments();
  }, [])

  useEffect(() => {
    if (user?.email) {
      const justFetch = async() => {
        await fetchDocuments()
      }

      justFetch();
    }
  }, [user]);

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      const response = await getSession()
      setUser(response?.user)
    }

    fetchSession().catch((error) => {
      console.log(error)
    })
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
        {/* <Sidebar
          isOpen={leftSidebar.isOpen}
          onClose={leftSidebar.close}
        /> */}

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
            className="w-full md:!w-1/2"
            startContent={<MagnifyingGlassIcon className="w-6 h-6" />}
            isClearable
            onChange={filterDocuments}
          />

          <Tabs
            key="tabs"
            color="primary"
            variant="underlined"
            aria-label="Tabs"
            fullWidth
            classNames={{
              tabList: "w-full md:w-1/2 p-0 border-b border-divider",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab key="for_you" title={`${'For you'} (${documents?.length})`} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-base font-semibold">
                  {`My personnal documents`}
                </p>
                
                <p className="text-sm font-normal text-foreground-500">
                  {`Here, a list of all your creations.`}
                </p>
              </div>
              {loading ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <>
                  {
                    documents?.map((document, index) => {
                      return <DocumentCard key={index} document={document} />
                    })
                  }
                </>
              }
            </Tab>

            <Tab key="latest" title={"Latest"} className="flex flex-col gap-4">
              {loadingLatest ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <>
                  {
                    latestDocuments?.map((document, index) => {
                      return <DocumentCard key={index} document={document} />
                    })
                  }
                </>
              }
            </Tab>

            {/* {
              topics?.map((topic, index) => {
                return (
                  <Tab key={index} title={topic}>

                  </Tab>
                )
              })
            } */}
          </Tabs>
        </div>
      </div>

      <Button
        isIconOnly
        variant="shadow"
        radius="full"
        color="primary"
        className="fixed bottom-4 right-4 z-[99]"
        onClick={goToNewDocument}
      >
        <CirclePlusIcon />
      </Button>
    </div>
  )
}