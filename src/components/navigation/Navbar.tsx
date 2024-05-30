"use client"

import React, { useState } from 'react'
import {
  Navbar as NavbarComponent,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
  Avatar,
  DropdownTrigger,
  Dropdown,
  DropdownItem,
  DropdownMenu
} from "@nextui-org/react";

const Navbar = (userId: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    "Product",
    "Features",
    "Pricing",
    "About us",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <NavbarComponent
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          {/* <AcmeLogo /> */}
          <p className="font-bold text-inherit">{'Drafts App'}</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            {'Product'}
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link color="foreground" href="#">
            {'Features'}
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link color="foreground" href="#">
            {'Pricing'}
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link color="foreground" href="#">
            {'About us'}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {!userId ? (
          <>
            <NavbarItem>
              <Button as={Link} color="primary" href="/sign-in" variant="shadow">
                {'Sign In'}
              </Button>
            </NavbarItem>
            
            <NavbarItem>
              <Button as={Link} color="default" href="/sign-up" variant="shadow">
                {'Sign Up'}
              </Button>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Button as={Link} color="primary" href="/app" variant="shadow">
              {'Go to App'}
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              className="w-full"
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>

      {/* <>
        {user &&
          <NavbarContent as="div" justify="end">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={user.fullName ? user?.fullName : ""}
                  size="sm"
                  src={user?.imageUrl}
                />
              </DropdownTrigger>

              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">{'Signed in as'}</p>
                  <p className="font-semibold">{ user?.fullName }</p>
                </DropdownItem>
                <DropdownItem key="settings">{'Settings'}</DropdownItem>
                <DropdownItem key="help_and_feedback">{'Help & Feedback'}</DropdownItem>
                <DropdownItem key="logout" color="danger">{'Log Out'}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        }
      </> */}
    </NavbarComponent>
  )
}

Navbar.displayName = 'Navbar'

export default Navbar