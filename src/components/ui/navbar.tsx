"use client"

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import ProfileModal from "../pannels/ProfileModal";
import { usePathname, useRouter } from "next/navigation";
import { MoonIcon, SunIcon, SettingsIcon, CircleHelpIcon, LogOutIcon, CircleUserRoundIcon, HomeIcon, BookTextIcon, SearchIcon, InfoIcon } from 'lucide-react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, useDisclosure, Input, Kbd, Modal, ModalBody, ModalContent, ModalHeader, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { search } from "@/actions/globalSearch";
import { useDebouncedCallback } from "use-debounce";
import UserItemInList from "./UserItemInList";
import DocumentItemInList from "./DocumentItemInList";

const NavbarApp = ({ user }: { user: any }) => {
  const router = useRouter();
  const pathname = usePathname()
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isUsername, setIsUsername] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({});
  const [isRotatingDark, setIsRotatingDark] = useState(false);
  const [isRotatingLight, setIsRotatingLight] = useState(false);
  const { isOpen: isOpenSearch, onOpenChange: onOpenChangeSearch } = useDisclosure();
  const { isOpen: isOpenProfile, onOpenChange: onOpenChangeProfile } = useDisclosure();

  const onLogout = () => {
    signOut({
      redirectTo: "/account/sign-in"
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

  const updateSearch = (value: string) => {
    setIsTyping(true)
    setSearchText(value)
    searchFunction(value)
  }

  const closeModalAndClearResults = () => {
    setSearchText("")
    setSearchResults({})
    onOpenChangeSearch()
  }

  const searchFunction = useDebouncedCallback(async (value: string) => {
    if (value) {
      const res = await search(value)

      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      }
    } else {
      setSearchResults({})
    }
    setIsTyping(false)
  }, 300)
  
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        onOpenChangeSearch()
      }
    }

    window.addEventListener('keydown', handleKeyEvent)

    return () => {
      window.removeEventListener('keydown', handleKeyEvent)
    }
  })

  useEffect(() => {
    if (searchText.startsWith('@')) {
      if (!isUsername) {
        setIsUsername(true)
      }
    } else {
      setIsUsername(false)
    }
  }, [searchText])

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
          >
              <div className="flex justify-between w-[250px]">
                <div className="flex items-center gap-1">
                  <SearchIcon />
                  <p>{"Search"}</p>
                </div>

                <Kbd keys={["command"]}>K</Kbd>
              </div>
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
                  <p>{'Signed in as'}</p>
                  <p className="font-semibold">{`${user?.firstname} ${user?.lastname}`}</p>
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
          <ModalHeader className="flex flex-col gap-3 p-3">
            <Input
              value={searchText}
              startContent={<SearchIcon />}
              classNames={{ input: isUsername ? '!text-primary' : '' }}
              placeholder="Search"
              variant="flat"
              isClearable
              className="!bg-transparent"
              onValueChange={updateSearch}
            ></Input>

            <Divider></Divider>
          </ModalHeader>

          <ModalBody className="flex flex-col px-0 pt-0 gap-0">
            <div className="flex flex-col h-[300px] gap-4">
              {
                isTyping ?
                  <div className="flex flex-col gap-4 px-3">
                    {
                      Array.from({ length: 10 }).map((_, index) =>
                        <UserItemInList
                          key={index}
                          avatar={""}
                          username={""}
                          firstname={""}
                          lastname={""}
                          loading={true}
                        />
                      )
                    }
                  </div>
                :
                searchText ?
                  <>
                    <div className="flex flex-col flex-1 gap-1.5">
                      <p className="text-foreground-500 text-xs px-3">{"People"}</p>

                      <div className={`flex h-full flex-col ${isTyping ? 'gap-4' : 'gap-1'}`}>
                        {
                          searchResults?.users?.length ?
                            searchResults?.users?.map((result: any, index: number) =>
                              <UserItemInList
                                key={index}
                                avatar={result?.avatar}
                                username={result?.username}
                                firstname={result?.firstname}
                                lastname={result?.lastname}
                                loading={false}
                              />
                            )
                          :
                          <p className="px-3">No results</p>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 gap-1.5">
                      <p className="text-foreground-500 text-xs px-3">{"Documents"}</p>

                      <div className={`flex h-full flex-col ${isTyping ? 'gap-4' : 'gap-1'}`}>
                        {
                          searchResults?.documents?.length ?
                            searchResults?.documents?.map((result: any, index: number) =>
                              <DocumentItemInList
                                key={index}
                                loading={false}
                                id={result?.id}
                                title={result?.title}
                                updatedAt={result?.updatedAt}
                                onCloseModal={closeModalAndClearResults}
                              />
                            )
                          :
                          <p className="px-3">No results</p>
                        }
                      </div>
                    </div>
                  </>
                :
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
                  <InfoIcon size={36} className="text-foreground-500" />

                  <p className="font-medium">{"Search"}</p>

                  <div className="flex flex-col items-center">
                    <p className="text-foreground-500 text-sm">{"Start typing something to see the results."}</p>
                    <p className="text-foreground-500 text-sm text-center">{"You can search for a document, a user or a username by typing '@username'."}</p>
                  </div>
                </div>
              }
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

NavbarApp.displayName = 'NavbarApp'

export default NavbarApp