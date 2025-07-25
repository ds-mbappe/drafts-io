"use client"

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import ProfileModal from "../pannels/ProfileModal";
import { usePathname, useRouter } from "next/navigation";
import { MoonIcon, SunIcon, SettingsIcon, CircleHelpIcon, LogOutIcon, CircleUserRoundIcon, HomeIcon, BookTextIcon, SearchIcon, InfoIcon, LaptopIcon } from 'lucide-react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, useDisclosure, Input, Kbd, Modal, ModalBody, ModalContent, ModalHeader, Divider, PressEvent } from "@heroui/react";
import { search } from "@/actions/globalSearch";
import { useDebouncedCallback } from "use-debounce";
import UserItemInList from "./UserItemInList";
import DocumentItemInList from "./DocumentItemInList";
import { useMobile } from "@/hooks/useMobile";

const NavbarApp = ({ user }: { user: any }) => {
  const router = useRouter();
  const pathname = usePathname()
  const isLargeScreen = useMobile();
  const { theme, setTheme } = useTheme();

  const [isTyping, setIsTyping] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isUsername, setIsUsername] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({});

  const { isOpen: isOpenSearch, onOpenChange: onOpenChangeSearch } = useDisclosure();
  const { isOpen: isOpenProfile, onOpenChange: onOpenChangeProfile } = useDisclosure();

  const onLogout = () => {
    signOut({
      redirectTo: "/account/sign-in"
    });
  }

  const switchTheme = (value: string) => {  
    if (value === 'dark' && theme !== 'dark') {
      setTheme('dark')
    } else if (value === 'light' && theme !== 'light') {
      setTheme('light')
    } else if (value === 'system' && theme !== 'system') {
      setTheme('system')
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

  const activeThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon />
      case 'dark':
        return <MoonIcon />
      case 'system':
        return <LaptopIcon />
      default:
        break;
    }
  }
  
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
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

  return (
    <>
      <Navbar isBordered maxWidth={"full"} className="bg-content1">
        <NavbarBrand className="flex gap-2">
          {/* Home button */}
          <Button isIconOnly size={"sm"} variant={"light"} onPress={goToHome}>
            { <HomeIcon /> }
          </Button>
        </NavbarBrand>

        {/* Nav Links */}
        {/* <NavbarContent justify="center">
          Hellooooo
        </NavbarContent> */}

        <NavbarContent justify="end">
          <Button isIconOnly={!isLargeScreen} radius="full" variant={isLargeScreen ? "flat" : "light"} onPress={onOpenChangeSearch}>
            {isLargeScreen ?
              <div className="flex justify-between w-[250px]">
                <div className="flex items-center gap-1">
                  <SearchIcon />
                  <p>{"Search"}</p>
                </div>

                <Kbd keys={["command"]}>K</Kbd>
              </div>
              : <SearchIcon /> 
            }
          </Button>

          {/* Theme Switcher */}
          <Dropdown placement="bottom-end" closeOnSelect={false}>
            <DropdownTrigger>
              <Button id="trigger-theme" isIconOnly variant="light" color="default" radius="full">
                {activeThemeIcon()}
              </Button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Theme switcher" variant="flat">
              <DropdownItem
                key="light_theme"
                startContent={
                  <SunIcon />
                }
                onPress={() => switchTheme('light')}
              >
                {'Light'}
              </DropdownItem>

              <DropdownItem
                key="dark_theme"
                startContent={
                  <MoonIcon />
                }
                onPress={() => switchTheme('dark')}
              >
                {'Dark'}
              </DropdownItem>

              <DropdownItem
                key="system_theme"
                startContent={
                  <LaptopIcon />
                }
                onPress={() => switchTheme('system')}
              >
                {'System'}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Avatar */}
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
                {'My Library'}
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
        </NavbarContent>
      </Navbar>

      <ProfileModal
        dialogOpen={isOpenProfile}
        changeDialogOpenState={onOpenChangeProfile}
      />

      {/* Search Modal */}
      <Modal
        size="xl"
        hideCloseButton
        placement="center"
        isOpen={isOpenSearch}
        scrollBehavior="inside"
        onOpenChange={onOpenChangeSearch}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-3 p-3">
            <Input
              value={searchText}
              autoFocus={true}
              startContent={<SearchIcon />}
              classNames={{
                input: isUsername ? '!text-primary' : '',
              }}
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