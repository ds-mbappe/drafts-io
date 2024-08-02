"use client"

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, User } from "@nextui-org/react";
import EditorInfo from './EditorInfo';
import { memo, useEffect, useState } from 'react';
import { PanelTopClose, PanelLeft } from 'lucide-react';
import HistoryDropdown from '../pannels/HistoryDropdown/HistoryDropdown';
import { signOut, getSession } from "next-auth/react";

const NavbarApp = memo(({ characters, words, status, isSidebarOpen, toggleSidebar, historyData, provider }: any) => {
  const [user, setUser] = useState<any>()

  const onLogout = () => {
    signOut({
      callbackUrl: "/account/sign-in"
    });
  }

  useEffect(() => {
    const fetchSession = async () => {
      const response = await getSession()
      setUser(response?.user)
    }

    fetchSession().catch((error) => {
      console.log(error)
    })
  }, [])

  if (!user) return

  return (
    <>
      <Navbar isBordered>
        <NavbarBrand>
          <Button isIconOnly size={"sm"} variant={"light"} onClick={toggleSidebar}>
            { isSidebarOpen ? <PanelTopClose className="-rotate-90" /> : <PanelLeft /> }
          </Button>
        </NavbarBrand>

        <NavbarContent justify="end">
          {
            provider ?
              <NavbarItem>
                <HistoryDropdown
                  provider={provider}
                  historyData={historyData}
                />
              </NavbarItem>
            : <></>
          }

          <NavbarItem>
            <div className="flex items-center justify-center gap-5">
              <div className="flex gap-2 items-center justify-center">
                <div className={`w-2 h-2 rounded-full flex gap-1 items-center justify-center ${status === 'Synced' ? 'bg-green-500' : status === 'Not Synced' ? 'bg-red-500' : 'bg-yellow-500'}`} />

                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  { status }
                </span>
              </div>

              <div className="h-8 border-r" />

              <EditorInfo words={words} characters={characters} />
            </div>
          </NavbarItem>

          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  color="primary"
                  name={user?.name?.split("")?.[0] || 'U'}
                  size="sm"
                  src={user?.image}
                />
              </DropdownTrigger>

              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2" textValue={`Signed in as ${user?.email}`}>
                  <p className="font-semibold">{'Signed in as'}</p>
                  
                  <p className="font-semibold">{ user?.email }</p>
                </DropdownItem>

                <DropdownItem key="settings">{'My Settings'}</DropdownItem>

                <DropdownItem key="help_and_feedback">{'Help & Feedback'}</DropdownItem>

                <DropdownItem key="logout" color="danger" onClick={onLogout}>{'Log Out'}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* <nav className="w-full h-14 flex items-center justify-between fixed top-0 z-40 bg-white px-4 border-b"> 
        <div className="flex items-center justify-center gap-5">

          <div className="h-8 border-r" />

          <EditorInfo words={words} characters={characters} />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="border-[0.5px] border-black cursor-pointer">
                <AvatarImage src={user?.image} />

                <AvatarFallback>
                  { `${user?.name?.split("")?.[0] || 'U'}` }
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-56'>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="gap-4 cursor-pointer">
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="gap-4 hover:!bg-red-100 hover:!text-red-500 cursor-pointer" onClick={onLogout}>
                <ExitIcon/>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav> */}
    </>
  )
})

NavbarApp.displayName = 'NavbarApp'

export default NavbarApp