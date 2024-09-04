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
    // "Pricing",
    "About us",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <NavbarComponent
      maxWidth="full"
      className="bg-content1"
      onMenuOpenChange={setIsMenuOpen}
      isBordered
    >
      <NavbarContent>
        {/* <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        /> */}

        <NavbarBrand>
          {/* <AcmeLogo /> */}
          <p className="font-bold text-content1-foreground">{'Drafts App'}</p>
        </NavbarBrand>
      </NavbarContent>

      {/* <NavbarContent className="hidden sm:flex gap-8" justify="center">
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
      </NavbarContent> */}

      {/* <NavbarContent justify="end">
        <NavbarItem>
          <Button as={Link} color="default" href="/app" variant="faded">
            {'Get started'}
          </Button>
        </NavbarItem>
      </NavbarContent> */}

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
    </NavbarComponent>
  )
}

Navbar.displayName = 'Navbar'

export default Navbar