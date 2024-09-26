"use client"

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, Tooltip, useDisclosure } from "@nextui-org/react";
import { memo, useEffect, useState } from 'react';
import { PanelTopClose, PanelLeft, MoonIcon, SunIcon, SettingsIcon, CircleHelpIcon, LogOutIcon, CirclePlayIcon, CircleUserRoundIcon, HomeIcon } from 'lucide-react';
import HistoryDropdown from '../pannels/HistoryDropdown/HistoryDropdown';
import { signOut, getSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { CreateNewDocument } from "../pannels/CreateNewDocument";
import { usePathname, useRouter } from "next/navigation";
import ProfileModal from "../pannels/ProfileModal";

const NavbarApp = memo(({ status, isSidebarOpen, toggleSidebar, historyData, provider }: any) => {
  const motionProps = {
    variants: {
      exit: {
        opacity: 0,
        transition: {
          duration: 0.15,
          ease: "easeIn",
        }
      },
      enter: {
        opacity: 1,
        transition: {
          duration: 0.15,
          ease: "easeOut",
        }
      },
    },
  }
  const router = useRouter();
  const pathname = usePathname()
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const onLogout = () => {
    signOut({
      callbackUrl: "/account/sign-in"
    });
  }

  const changeTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    }
  }

  const onStartSpeak = async() => {
    
  }

  const goToHome = () => {
    router.push('/app')
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

  return (
    <>
      <Navbar isBordered maxWidth={"full"} className="bg-content1">
        <NavbarBrand className="flex gap-2">
          {/* Home button */}
          {pathname !== '/app' &&
            <Button isIconOnly size={"sm"} variant={"light"} onClick={goToHome}>
              { <HomeIcon /> }
            </Button>
          }
        </NavbarBrand>

        <NavbarContent justify="end">
          {/* History dropdown */}
          {/* { provider && document?.creator_email === user?.email ?
            <NavbarItem>
              <HistoryDropdown
                provider={provider}
                historyData={historyData}
              />
            </NavbarItem> : <></>
          } */}

          {/* Status */}
          {/* { (document?.id || pathname === '/app/new-doc') &&
            <NavbarItem>
              <div className="flex items-center justify-center gap-5">
                <div className="flex gap-2 items-center justify-center">
                  <div className={`w-2 h-2 rounded-full flex gap-1 items-center justify-center ${status === 'Synced' ? 'bg-green-500' : status === 'Not Synced' ? 'bg-red-500' : 'bg-yellow-500'}`} />

                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    { status }
                  </span>
                </div>
              </div>
            </NavbarItem>
          } */}
          
          {/* Avatar */}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  color="primary"
                  showFallback
                  name={user?.email?.split("")?.[0]?.toUpperCase()}
                  size="sm"
                  src={user?.avatar}
                />
              </DropdownTrigger>

              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="email" className="h-14 gap-2" textValue={`Signed in as ${user?.email}`}>
                  <p className="font-semibold">{'Signed in as'}</p>
                  
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>

                <DropdownItem
                  key="profile"
                  startContent={<CircleUserRoundIcon />}
                  onClick={onOpenChange}
                >
                  {'My profile'}
                </DropdownItem>

                <DropdownItem
                  key="dark_mode"
                  textValue={'Dark mode'}
                  onClick={changeTheme}
                  startContent={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                >  
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownItem>

                <DropdownItem
                  key="settings"
                  startContent={<SettingsIcon />}
                >
                  {'Settings'}
                </DropdownItem>

                <DropdownItem
                  key="help_and_feedback"
                  startContent={<CircleHelpIcon />}
                >
                  {'Help & Feedback'}
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onClick={onLogout}
                  startContent={<LogOutIcon />}
                >
                  {'Log Out'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <ProfileModal
        user={user}
        changeDialogOpenState={onOpenChange}
        dialogOpen={isOpen}
      />
    </>
  )
})

NavbarApp.displayName = 'NavbarApp'

export default NavbarApp