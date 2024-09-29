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
import { CircleArrowRightIcon, CirclePlusIcon, SearchIcon, SquarePenIcon } from 'lucide-react';
import DocumentCard from '@/components/card/DocumentCard';
import { toast } from "sonner";
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();
  const leftSidebar = useSidebar();
  const [user, setUser] = useState<any>()
  const [loading, setIsLoading] = useState(false)
  const [loadingLatest, setIsLoadingLatest] = useState(false)
  const [documents, setDocuments] = useState([])
  const [saveStatus, setSaveStatus] = useState("Synced")
  const [latestDocuments, setLatestDocuments] = useState([])

  useEffect(() => {
    const resizer = () => {
      if (window.innerWidth > 1024 && !leftSidebar.isOpen) {
        leftSidebar.toggle()
      } else if (window.innerWidth <= 1023 && leftSidebar.isOpen) {
        leftSidebar.toggle()
      }
    }

    window.addEventListener('resize', resizer)

    return () => {
      window.removeEventListener('resize', resizer)
    }
  })

  // Fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    const data = await fetch(`/api/documents/${user?.id}`, {
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

  const goToNewDocument = async () => {
    let formData = {
      title: `Untitled_${new Date()}`,
      authorId: user?.id,
      authorAvatar: user?.avatar,
      authorFirstname: user?.firstname,
      authorLastname: user?.lastname,
      cover: null,
      topic: null,
    }

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })

    if (res?.ok) {
      await res.json().then((data) => {
        toast.success(`Success`, {
          description: `Document created successfully!`,
          duration: 5000,
          important: true,
        })
        router.push(`/app/${data?.document?.id}`)
      })
    } else {
      toast.error(`Error`, {
        description: `Error creating new document.`,
        duration: 5000,
        important: true,
      })
    }
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

  return (
    <div className="w-full flex relative overflow-hidden">
      <Sidebar
        isOpen={leftSidebar.isOpen}
        onClose={leftSidebar.toggle}
      />

      <div className="w-full h-full flex flex-col flex-1 overflow-y-auto">
        <div className="w-full max-w-[1024px] mx-auto relative flex cursor-text flex-col gap-2 z-[1] flex-1 px-5 2xl:!px-0 pt-8 pb-5">
          <Input
            key="input-search"
            variant="bordered"
            type="text"
            className="px-4"
            isClearable
            placeholder={"Search"}
            startContent={<SearchIcon/>}
          />
          
          {/* <Input
            type="text"
            placeholder="Search"
            variant="bordered"
            className="w-full md:!w-1/2"
            startContent={<MagnifyingGlassIcon className="w-6 h-6" />}
            isClearable
            onChange={filterDocuments}
          /> */}

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
            <Tab key="for_you" title={`Following`} className="flex flex-col gap-4">
              {loading ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <>
                  { documents?.length ?
                    <div className="w-full flex flex-col gap-4 md:!grid md:!grid-cols-2">
                      {
                        documents?.map((document, index) => {
                          return <DocumentCard key={index} document={document} />
                        })
                      }
                    </div> :
                    <p className="text-sm font-normal text-foreground-500">
                      {`You have not created a document yet, start by clicking the button at the bottom right of your screen.`}
                    </p>
                  }
                </>
              }
            </Tab>

            <Tab key="latest" title={`Discover`} className="flex flex-col gap-4">
              {loadingLatest ?
                <div className="w-full h-full my-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>:
                <>
                  { latestDocuments?.length ?
                    <div className="w-full flex flex-col gap-4 md:!grid md:!grid-cols-2">
                      {
                        latestDocuments?.map((document, index) => {
                          return <DocumentCard key={index} document={document} />
                        })
                      }
                    </div> :
                    <p className="text-sm font-normal text-foreground-500">
                      {`There is no public document for now, come back later ;).`}
                    </p>
                  }
                </>
              }
            </Tab>
          </Tabs>
        </div>
      </div>

      <Button
        variant="shadow"
        radius="full"
        color="primary"
        startContent={<SquarePenIcon />}
        className="fixed bottom-4 right-4 z-[99]"
        onClick={goToNewDocument}
      >
        {'New draft'}
      </Button>
    </div>
  )
}