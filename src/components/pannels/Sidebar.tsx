"use client"

import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { LeftSidebarDocumentItem } from "./LeftSidebarDocumentItem";
import { useDebouncedCallback } from "use-debounce";
import { Input, Divider, Button, Avatar } from "@nextui-org/react";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { getSession } from "next-auth/react";

const Sidebar = memo(({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>()
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState([])
    
  // const handlePotentialClose = useCallback(() => {
  //   if (window.innerWidth < 1024) {
  //     onClose()
  //   }
  // }, [onClose])

  const windowClassName = cn(
    'absolute h-screen left-0 top-0 xl:relative z-[2] w-0 duration-300 transition-all',
    !isOpen && 'border-r-transparent',
    isOpen && 'w-[350px] xl:!static border-r border-r-divider',
  )

  const fetchDocuments = async () => {
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
  }

  const onDocumentEdited = async (document: any) => {
    // let editedDocument: any = documents?.find((doc: any) => doc?._id === document?.id)
    // if (editedDocument) {
    //   editedDocument.name = document?.name
    // }
  }

  // Search
  const filterDocuments = useDebouncedCallback(async(e: any) => {
    // let dataPersonal = documents

    // dataPersonal = dataPersonal.filter((doc: any) => doc?.name?.toLowerCase()?.startsWith(e.target.value))

    // const res = await fetch(`/api/documents/${user?.email}?search=${e?.target?.value}`, {
    //   method: "GET",
    //   headers: { "Content-Type": "application/json" },
    // })
    // const data = await res.json()
  }, 300)

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

  // Fetch documents
  useEffect(() => {
    if (user?.email) {
      const justFetch = async() => {
        await fetchDocuments()
      }

      justFetch();
    }
  }, [user]);

  return (
    <div className={`${windowClassName} h-full bg-content1 flex flex-col overflow-visible gap-8 xl:!relative hideScroll`}>
      <div className={`${windowClassName} ${isOpen ? 'opacity-100 px-4' : 'opacity-0 px-0'} h-full bg-content1 flex flex-col overflow-x-hidden overflow-y-auto py-8 gap-8 relative`}>
        {/* Profile */}
        <div className="w-full flex items-center gap-2.5 p-2.5 rounded-[12px] border border-divider cursor-pointer transition-all hover:bg-foreground-100 active:scale-[0.95]">
          <Avatar
            as="button"
            color="primary"
            showFallback
            name={user?.firstname?.split("")?.[0]?.toUpperCase()}
            size="md"
            src={user?.avatar}
          />

          <div className="flex flex-col">
            <p className="font-semibold text-sm">
              {`${user?.firstname} ${user?.lastname}`}
            </p>

            <p className="text-foreground-500 text-sm">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Home button */}
          <Link href="/app">
            <div className="w-full flex gap-2 p-2.5 items-center rounded-md hover:bg-foreground-100 transition-all active:scale-[0.95]">
              <HomeIcon size={20} />
              <p className="font-semibold">{'Home'}</p>
            </div>
          </Link>

          {/* <Divider />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              {
                documents?.map((doc: any) =>
                  <LeftSidebarDocumentItem
                    key={doc?.id}
                    user={user}
                    document={doc}
                  />
                )
              }
            </div>
          </div> */}
        </div>
      </div>

      <Button
        variant="solid"
        radius="full"
        color="primary"
        isIconOnly
        className={cn(!isOpen && 'hover:scale-[1.15] hover:translate-x-[20px] transition-all duration-400', 'z-[20] bg-divider absolute top-1/2 -translate-y-1/2 -right-[20px]')}
        onPress={onClose}
      >
        {isOpen ? <ChevronLeftIcon size={28} /> : <ChevronRightIcon size={28} />}
      </Button>
    </div>
  )
})

Sidebar.displayName = 'ContentSidebar'

export default Sidebar