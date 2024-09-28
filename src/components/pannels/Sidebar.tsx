"use client"

import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { LeftSidebarDocumentItem } from "./LeftSidebarDocumentItem";
import { useDebouncedCallback } from "use-debounce";
import { Input, Divider, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, useDisclosure } from "@nextui-org/react";
import { BookmarkIcon, BookOpenTextIcon, BookTextIcon, ChevronLeftIcon, ChevronRightIcon, CircleHelpIcon, ClockIcon, HomeIcon, LayoutListIcon, LogOutIcon, MoonIcon, SearchIcon, SettingsIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { getSession, signOut } from "next-auth/react";
import ProfileModal from "./ProfileModal";
import { useTheme } from "next-themes";

const Sidebar = memo(({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<any>()
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false)
  const [documents, setDocuments] = useState([]);
  const { isOpen: isOpenProfile, onOpen, onOpenChange } = useDisclosure();
    
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

  const onLogout = () => {
    signOut({
      callbackUrl: "/account/sign-in"
    });
  }

  const changeTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else if (resolvedTheme === 'light') {
      setTheme('dark')
    }
  }

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

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) {
    return null
  }

  return (
    <div className={`${windowClassName} h-full bg-content1 flex flex-col overflow-visible gap-8 xl:!relative hideScroll`}>
      <div className={`${windowClassName} ${isOpen ? 'opacity-100 px-4' : 'opacity-0 px-0'} h-full bg-content1 flex flex-col overflow-x-hidden overflow-y-auto py-8 gap-8 relative`}>
        {/* Profile */}
        <div className="w-full flex items-center gap-2.5 p-2.5 rounded-[12px] border border-divider cursor-pointer transition-all hover:bg-foreground-100 active:scale-[0.95]" onClick={onOpenChange}>
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

        {/* Theme Switcher */}
        <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]" onClick={changeTheme}>
          {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
          {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </div>

        <div className="flex flex-col gap-2">
          {/* Home button */}
          <Link href="/app">
            <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] hover:bg-foreground-100 transition-all active:scale-[0.95]">
              <HomeIcon size={20} />
              <p className="font-semibold">{'Home'}</p>
            </div>
          </Link>

          {/* Library */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]">
            <BookTextIcon size={20} />
            <p className="font-semibold">{'Library'}</p>
          </div>

          {/* Saved Drafts */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]">
            <BookmarkIcon size={20} />
            <p className="font-semibold">{'Saved'}</p>
          </div>

          {/* Read History */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]">
            <ClockIcon size={20} />
            <p className="font-semibold">{'Recently Read'}</p>
          </div>
          
          <Divider />

          {/* Trending */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]">
            <BookOpenTextIcon size={20} />
            <p className="font-semibold">{'Trending'}</p>
          </div>

          {/* Topics */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]">
            <LayoutListIcon size={20} />
            <p className="font-semibold">{'Topics'}</p>
          </div>

          <Divider />

          {/* Settings */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]">
            <SettingsIcon size={20} />
            <p className="font-semibold">{'Settings'}</p>
          </div>

          {/* Help */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]">
            <CircleHelpIcon size={20} />
            <p className="font-semibold">{'Help'}</p>
          </div>

          {/* Sign out */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-danger hover:bg-foreground-100 transition-all active:scale-[0.95]" onClick={onLogout}>
            <LogOutIcon size={20} />
            <p className="font-semibold">{'Sign out'}</p>
          </div>

          {/* <div className="flex flex-col gap-3">
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

      <ProfileModal
        user={user}
        changeDialogOpenState={onOpenChange}
        dialogOpen={isOpenProfile}
      />

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