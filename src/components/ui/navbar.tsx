"use client"

import { ExitIcon } from '@radix-ui/react-icons'
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
import EditorInfo from './EditorInfo';
import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { PanelTopClose, PanelLeft } from 'lucide-react';
import HistoryDropdown from '../pannels/HistoryDropdown/HistoryDropdown';
import { Button as NewButton } from '@nextui-org/react';

const Navbar = memo(({ characters, words, status, isSidebarOpen, toggleSidebar, historyData, provider }: any) => {
  const user: any = null
  const router = useRouter()

  const onSignOut = async () => {
    try {
      const response = await fetch("/api/account/signout", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      // const data = await response.json();
      // console.log(data)
      if (response.ok) {
        router.push("/account/sign-in");
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  const onUserLogout = () => {
    router.replace("/")
  };

  return (
    <nav className="w-full h-14 flex items-center justify-between fixed top-0 z-40 bg-white px-4 border-b">
      <Button size={"sm"} variant={"ghost"} onClick={toggleSidebar}>
        { isSidebarOpen ? <PanelTopClose className="-rotate-90" /> : <PanelLeft /> }
      </Button>
      
      <NewButton
        color="primary"
        onClick={onSignOut}
      >
        Sign out
      </NewButton>
      
      { user?.imageUrl ?
        <>
          <div className="flex items-center justify-center gap-5">
            <div className="flex gap-2 items-center justify-center">
              {
                provider ?
                  <HistoryDropdown
                    provider={provider}
                    historyData={historyData}
                  /> : <></>
              }

              <div className={`w-2 h-2 rounded-full flex gap-1 items-center justify-center ${status === 'Synced' ? 'bg-green-500' : status === 'Not Synced' ? 'bg-red-500' : 'bg-yellow-500'}`} />

              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                { status }
              </span>
            </div>

            <div className="h-8 border-r" />

            <EditorInfo words={words} characters={characters} />

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="border-[0.5px] border-black cursor-pointer">
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

Navbar.displayName = 'NavbarApp'

export default Navbar