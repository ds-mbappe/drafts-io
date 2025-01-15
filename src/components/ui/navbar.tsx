"use client"

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { memo, useContext } from 'react';
import { MoonIcon, SunIcon, SettingsIcon, CircleHelpIcon, LogOutIcon, CircleUserRoundIcon, HomeIcon } from 'lucide-react';
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { NextSessionContext } from "@/contexts/SessionContext";

const NavbarApp = memo(() => {
  const router = useRouter();
  const pathname = usePathname()
  const { theme, setTheme } = useTheme();
  const { onOpenChange } = useDisclosure();
  const nextSession = useContext(NextSessionContext)

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

  const goToHome = () => {
    router.push('/app')
  }

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
          {/* Avatar */}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  color="primary"
                  showFallback
                  name={nextSession?.user?.email?.split("")?.[0]?.toUpperCase()}
                  size="sm"
                  src={nextSession?.user?.avatar}
                />
              </DropdownTrigger>

              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="email" className="h-14 gap-2" textValue={`Signed in as ${nextSession?.user?.email}`}>
                  <p className="font-semibold">{'Signed in as'}</p>
                  
                  <p className="font-semibold">{nextSession?.user?.email}</p>
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

      {/* <ProfileModal
        user={nextSession?.user}
        changeDialogOpenState={onOpenChange}
        dialogOpen={isOpen}
      /> */}
    </>
  )
})

NavbarApp.displayName = 'NavbarApp'

export default NavbarApp