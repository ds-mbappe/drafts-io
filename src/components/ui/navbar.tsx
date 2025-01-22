"use client"

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import ProfileModal from "../pannels/ProfileModal";
import { usePathname, useRouter } from "next/navigation";
import { MoonIcon, SunIcon, SettingsIcon, CircleHelpIcon, LogOutIcon, CircleUserRoundIcon, HomeIcon, BookTextIcon, SearchIcon } from 'lucide-react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, useDisclosure, Input, Kbd, Modal, ModalBody, ModalContent, ModalHeader, Divider } from "@nextui-org/react";
import { motion } from "framer-motion";

const NavbarApp = ({ user }: { user: any }) => {
  const router = useRouter();
  const pathname = usePathname()
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isRotatingLight, setIsRotatingLight] = useState(false);
  const [isRotatingDark, setIsRotatingDark] = useState(false);
  const { isOpen: isOpenProfile, onOpenChange: onOpenChangeProfile } = useDisclosure();
  const { isOpen: isOpenSearch, onOpenChange: onOpenChangeSearch } = useDisclosure();

  const onLogout = () => {
    signOut({
      callbackUrl: "/account/sign-in"
    });
  }

  const switchTheme = (value: string) => {    
    if (value === 'dark' && (theme === 'light' || theme === 'system')) {
      setIsRotatingDark(!isRotatingDark)
      setTheme('dark')
    } else if (value === 'light' && (theme === 'dark' || theme === 'system')) {
      setIsRotatingLight(!isRotatingLight)
      setTheme('light')
    }
  }

  const goToHome = () => {
    router.push('/app')
  }

  const goToMyLibrary = () => {
    router.push(`/app/library`)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <Navbar isBordered maxWidth={"full"} className="bg-content1">
        <NavbarBrand className="flex gap-2">
          {/* Home button */}
          {pathname !== '/app' &&
            <Button isIconOnly size={"sm"} variant={"light"} onPress={goToHome}>
              { <HomeIcon /> }
            </Button>
          }
        </NavbarBrand>

        <NavbarContent justify="end">
          <Button isIconOnly radius="full" variant={"light"} className="md:hidden" onPress={onOpenChangeSearch}>
            { <SearchIcon /> }
          </Button>

          <Button
            radius="full"
            variant="flat"
            className="hidden md:flex"
            onPress={onOpenChangeSearch}
            children={
              <div className="flex justify-between w-[250px]">
                <div className="flex items-center gap-1">
                  <SearchIcon />
                  <p>{"Search"}</p>
                </div>

                <Kbd keys={["command"]}>K</Kbd>
              </div>
            }
          >
          </Button>

          <NavbarItem>
            <Dropdown placement="bottom-end" closeOnSelect={false}>
              <DropdownTrigger>
                <Button id="trigger-theme" isIconOnly variant="light" color="default" radius="full">
                  {theme === 'light' ? <SunIcon /> : <MoonIcon />}
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Theme switcher" variant="flat">
                <DropdownItem
                  key="light_theme"
                  startContent={
                    <motion.div animate={{ rotate: isRotatingLight ? 360 : 0 }} transition={{ ease: 'easeInOut', duration: 0.75 }}>
                      <SunIcon />
                    </motion.div>
                  }
                  onPress={() => switchTheme('light')}
                >
                  {'Light'}
                </DropdownItem>

                <DropdownItem
                  key="dark_theme"
                  startContent={
                    <motion.div animate={{ rotate: isRotatingDark ? 360 : 0 }} transition={{ ease: 'easeInOut', duration: 0.75 }}>
                      <MoonIcon />
                    </motion.div>
                  }
                  onPress={() => switchTheme('dark')}
                >
                  {'Dark'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>

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
                <DropdownItem key="email" className="h-14 gap-2" textValue={`signed_in_as`}>
                  <p className="font-semibold">{'Signed in as'}</p>
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>

                <DropdownItem
                  key="profile"
                  startContent={<CircleUserRoundIcon />}
                  onPress={onOpenChangeProfile}
                >
                  {'Profile'}
                </DropdownItem>

                <DropdownItem
                  key="library"
                  startContent={<BookTextIcon />}
                  onPress={goToMyLibrary}
                >
                  {'Library'}
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
                  onPress={onLogout}
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
        changeDialogOpenState={onOpenChangeProfile}
        dialogOpen={isOpenProfile}
      />

      <Modal placement="center" size="xl" hideCloseButton isOpen={isOpenSearch} scrollBehavior="inside" onOpenChange={onOpenChangeSearch}>
        <ModalContent>
          <ModalBody className="flex flex-col p-0 gap-0">
            <Input
              startContent={<SearchIcon />}
              placeholder="Search for a document or a user by typing '@username'"
              variant="flat"
              className="p-3 !bg-transparent"
              endContent={<Kbd keys={["command"]}>K</Kbd>}
            ></Input>

            <Divider></Divider>

            <div className="flex flex-col p-4">
              Hehehehe
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

NavbarApp.displayName = 'NavbarApp'

export default NavbarApp