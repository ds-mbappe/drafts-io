"use client"

import { HomeIcon } from 'lucide-react';
import NavbarEndContent from "./NavbarEndContent";
import { Navbar, NavbarBrand, Button } from "@heroui/react";
import NavbarCenterContent from './NavbarCenterContent';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavbarApp = ({ user }: { user?: any }) => {
  const route = usePathname();

  return (
    <Navbar isBordered maxWidth={"full"} className="bg-content1" classNames={{wrapper: 'px-3'}}>
      <NavbarBrand className="flex gap-2">
        <Button
          href="/"
          as={Link}
          isIconOnly
          size={"sm"}
          variant={"light"}
          color={route === '/' ? 'primary' : 'default'}
        >
          { <HomeIcon /> }
        </Button>
      </NavbarBrand>

      <NavbarCenterContent className="hidden lg:flex" />

      <NavbarEndContent user={user} />
    </Navbar>
  )
}

NavbarApp.displayName = 'NavbarApp'

export default NavbarApp