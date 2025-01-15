"use client"

import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState, memo, useContext } from 'react';
import { Divider, Button, Avatar, useDisclosure } from "@nextui-org/react";
import { BookmarkIcon, BookOpenTextIcon, BookTextIcon, ChevronLeftIcon, ChevronRightIcon, CircleHelpIcon, ClockIcon, HomeIcon, LayoutListIcon, LogOutIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import ProfileModal from "./ProfileModal";
import { useTheme } from "next-themes";
import { NextSessionContext } from '@/contexts/SessionContext';

const Sidebar = memo(({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { session } = useContext(NextSessionContext)
  const [mounted, setMounted] = useState(false)
  const { isOpen: isOpenProfile, onOpenChange } = useDisclosure();

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

  const goToMyLibrary = () => {
    router.push(`/app/library`)
  }

  const changeTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else if (resolvedTheme === 'light') {
      setTheme('dark')
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`${windowClassName} h-full bg-content1 flex flex-col overflow-visible gap-8 xl:!relative hideScroll !z-50`}>
      <div className={`${windowClassName} ${isOpen ? 'opacity-100 px-4' : 'opacity-0 px-0'} h-full bg-content1 flex flex-col overflow-x-hidden overflow-y-auto py-8 gap-5 relative`}>
        {/* Profile */}
        <div className="w-full flex items-center gap-2.5 p-2.5 rounded-[12px] border border-divider cursor-pointer transition-all hover:bg-foreground-100 active:scale-[0.95]" onClick={onOpenChange}>
          <Avatar
            as="button"
            color="primary"
            showFallback
            name={session?.user?.firstname?.split("")?.[0]?.toUpperCase()}
            size="md"
            src={session?.user?.avatar}
          />

          <div className="flex flex-col">
            <p className="font-semibold text-sm">
              {`${session?.user?.firstname} ${session?.user?.lastname}`}
            </p>

            <p className="text-foreground-500 text-sm">
              {session?.user?.email}
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
            <div className={cn('w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]', pathname === '/app' && '!text-foreground !bg-foreground-100')}>
              <HomeIcon size={20} />
              <p className="font-semibold">{'Home'}</p>
            </div>
          </Link>

          {/* Library */}
          <div className="w-full flex gap-2 p-2.5 items-center rounded-[12px] cursor-pointer text-foreground-500 hover:text-foreground hover:bg-foreground-100 transition-all active:scale-[0.95]" onClick={goToMyLibrary}>
            <BookTextIcon size={20} />
            <p className="font-semibold">{'My library'}</p>
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
        </div>
      </div>

      <ProfileModal
        changeDialogOpenState={onOpenChange}
        dialogOpen={isOpenProfile}
      />

      <Button
        variant={isOpen ? 'solid' : 'flat'}
        radius="full"
        color="primary"
        isIconOnly
        title={isOpen ? 'Close sidebar (Alt + S)' : 'Open sidebar (Alt + S)'}
        className={cn(!isOpen && 'hover:scale-[1.15] hover:translate-x-[20px] transition-all duration-400', 'z-[20] absolute top-1/2 -translate-y-1/2 -right-[20px]')}
        onPress={onClose}
      >
        {isOpen ? <ChevronLeftIcon size={28} /> : <ChevronRightIcon size={28} />}
      </Button>
    </div>
  )
})

Sidebar.displayName = 'ContentSidebar'

export default Sidebar