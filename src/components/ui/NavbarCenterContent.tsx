import { cn, NavbarContent, NavbarItem } from '@heroui/react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

const NavbarCenterContent = ({
  className
}: {
  className?: string
}) => {
  const route = usePathname();

  const navbarItems = [
    { key: 'home', label: 'Home', href: "/app" },
    { key: 'categories', label: 'Categories', href: "#" },
    { key: 'about', label: 'About us', href: "#" },
    { key: 'contact', label: 'Contact', href: "#" },
  ];

  return (
    <>
      <NavbarContent justify="center" className={cn("gap-10", className)}>
        {navbarItems.map(({ key, label, href }) => (
          <NavbarItem
            key={`nav_item_${key}`}
            as={Link}
            href={href}
            isActive={route === href}
            className="transition-all hover:text-primary font-medium data-[active=true]:text-primary"
          >
            {label}
          </NavbarItem>
        ))}
      </NavbarContent>
    </>
  )
}

export default NavbarCenterContent