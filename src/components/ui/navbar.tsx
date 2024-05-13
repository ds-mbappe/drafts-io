"use client"

import { ExitIcon } from '@radix-ui/react-icons'
import { useUser, useAuth } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EditorInfo from './EditorInfo';
import { memo } from 'react';
import { LeftSidebar } from '../pannels/LeftSidebar';
import { useRouter } from 'next/navigation';

const Navbar = memo(({ characters, words, status }: any) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter()

  const onUserLogout = () => {
    signOut();
    router.replace("/")
  };

  return (
    <nav className="w-full h-14 flex items-center justify-between sticky top-0 z-40 bg-white px-4 border-b">
      <LeftSidebar />
      
      { user?.imageUrl ?
        <>
          <div className="flex items-center justify-center gap-5">
            <div className="flex gap-2 items-center justify-center">
              <div className={`w-2 h-2 rounded-full flex gap-1 items-center justify-center ${status === 'Saved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                { status }
              </span>
            </div>

            <div className="h-8 border-r" />

            <EditorInfo words={words} characters={characters} />

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="border-2 border-black cursor-pointer">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>
                    { `${user?.firstName || "A" + user?.lastName}` }
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56'>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-4 cursor-pointer">
                  {/* <PersonIcon/> */}
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-4 hover:!bg-red-100 hover:!text-red-500 cursor-pointer" onClick={onUserLogout}>
                  <ExitIcon/>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </> : <></>
      }
    </nav>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar