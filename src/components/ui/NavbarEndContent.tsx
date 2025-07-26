import { useMobile } from '@/hooks/useMobile';
import { BaseUser } from '@/lib/types';
import Link from 'next/link';
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Kbd, NavbarContent, useDisclosure } from '@heroui/react'
import { BookTextIcon, CircleHelpIcon, CircleUserRoundIcon, LaptopIcon, LogOutIcon, MoonIcon, PenToolIcon, SearchIcon, SettingsIcon, SunIcon } from 'lucide-react'
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo } from 'react'
import ModalSearch from '../pannels/ModalSearch';
import ProfileModal from '../pannels/ProfileModal';

const NavbarEndContent = ({ user }: { user?: BaseUser }) => {
  const router = useRouter();
  const route = usePathname();
  const isLargeScreen = useMobile();
  const { theme, setTheme } = useTheme();
  const { isOpen: isOpenSearch, onOpenChange: onOpenChangeSearch } = useDisclosure();
  const { isOpen: isOpenProfile, onOpenChange: onOpenChangeProfile } = useDisclosure();

  const isHomePage = useMemo(() => {
    return route === '/'
  }, [route])

  const switchTheme = (value: string) => {  
    if (value === 'dark' && theme !== 'dark') {
      setTheme('dark')
    } else if (value === 'light' && theme !== 'light') {
      setTheme('light')
    } else if (value === 'system' && theme !== 'system') {
      setTheme('system')
    }
  }

  const goToMyLibrary = () => {
    router.push(`/app/library`)
  }

  const onLogout = () => {
    signOut({
      redirectTo: "/account/sign-in"
    });
  }

  const menuItems = [
    { key: 'profile', label: 'Profile', danger: undefined, className: undefined, icon: CircleUserRoundIcon, onPress: onOpenChangeProfile },
    { key: 'library', label: 'My Library', danger: undefined, className: undefined, icon: BookTextIcon, onPress: goToMyLibrary },
    { key: 'settings', label: 'Settings', danger: undefined, className: undefined, icon: SettingsIcon },
    { key: 'help_and_feedback', label: 'Help & Feedback', danger: undefined, className: undefined, icon: CircleHelpIcon },
    { key: 'logout', label: 'Log Out', danger: false, className: 'text-danger', icon: LogOutIcon, onPress: onLogout }
  ];
  const themeOptions = [
    { key: 'light', label: 'Light', icon: SunIcon },
    { key: 'dark', label: 'Dark', icon: MoonIcon },
    { key: 'system', label: 'System', icon: LaptopIcon }
  ];
  const currentThemeOption = themeOptions.find((option) => option.key === theme?.toString());
  const CurrentIcon = currentThemeOption?.icon;

  return (
    <>
      <NavbarContent justify="end">
        {isHomePage ?
          <div className="flex gap-3 items-center">
            <Button
              as={Link}
              radius="sm"
              variant="bordered"
              href="/app/new_draft"
              className="transition-all hover:scale-105"
              startContent={<PenToolIcon/>}
            >
              {'Write'}
            </Button>

            <Button
              as={Link}
              radius="sm"
              color="primary"
              variant="shadow"
              href="/account/sign-up"
              className="transition-all hover:scale-105"
            >
              {'Join now'}
            </Button>
          </div> :
          <>
            <Button radius="full" variant="flat" onPress={onOpenChangeSearch} className="hidden 2xl:flex">
              <div className="flex justify-between w-[250px]">
                <div className="flex items-center gap-1">
                  <SearchIcon />
                  <p>{"Search"}</p>
                </div>

                <Kbd keys={["command"]}>K</Kbd>
              </div>
            </Button>

            <Button variant="light" isIconOnly radius="full" onPress={onOpenChangeSearch} className="2xl:hidden">
              <SearchIcon />
            </Button>
            
            <Dropdown placement="bottom-end" closeOnSelect={false}>
              <DropdownTrigger>
                <Button id="trigger-theme" isIconOnly variant="light" color="default" radius="full">
                  {CurrentIcon && <CurrentIcon />}
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Theme switcher" variant="flat" disabledKeys={[`${theme}_theme`]}>
                {themeOptions.map(({ key, label, icon: Icon }) => (
                  <DropdownItem
                    key={`${key}_theme`}
                    startContent={<Icon />}
                    onPress={() => switchTheme(key)}
                  >
                    {label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

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

                <>
                  {menuItems.map(({ key, label, icon: Icon, onPress, className, danger }) => (
                    <DropdownItem
                      key={key}
                      className={className}
                      startContent={<Icon />}
                      color={danger ? "danger" : "default"}
                      onPress={onPress}
                    >
                      {label}
                    </DropdownItem>
                  ))}
                </>
              </DropdownMenu>
            </Dropdown>
          </>
        }
      </NavbarContent>

      {!isHomePage &&
        <>
          <ProfileModal
            dialogOpen={isOpenProfile}
            changeDialogOpenState={onOpenChangeProfile}
          />
          
          <ModalSearch
            isOpenSearch={isOpenSearch}
            onOpenChangeSearch={onOpenChangeSearch}
          />
        </>
      }
    </>
  )
}

export default NavbarEndContent