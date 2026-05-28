"use client"

import { MenuIcon } from 'lucide-react';
import NavbarEndContent from "./NavbarEndContent";
import NavbarCenterContent from './NavbarCenterContent';
import type { NavbarAppProps } from './types';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useMobile } from '@/hooks/useMobile';

const NavbarApp = ({ user }: NavbarAppProps) => {
  const { toggle, setMode, mode, scheduleClose, cancelClose } = useSidebarStore();
  const isLargeScreen = useMobile();

  const handleBurgerClick = () => {
    if (isLargeScreen) {
      // Desktop: dock / undock
      toggle();
    } else {
      // Mobile: toggle floating panel only — no layout shift
      setMode(mode === 'floating' ? 'hidden' : 'floating');
    }
  };

  return (
    <div className="h-[44px] w-full flex items-center justify-between px-3 border-b border-divider bg-background/80 backdrop-blur-md shrink-0 relative z-30">
      {/* Burger */}
      <div className="flex items-center">
        <button
          className="inline-flex items-center justify-center p-1.5 rounded-lg text-foreground hover:bg-foreground-100 transition-colors cursor-pointer"
          onClick={handleBurgerClick}
          onMouseEnter={() => { cancelClose(); if (mode === 'hidden') setMode('floating'); }}
          onMouseLeave={scheduleClose}
        >
          <MenuIcon size={18} />
        </button>
      </div>

      {/* Center nav */}
      <NavbarCenterContent className="hidden lg:flex" />

      {/* Right actions */}
      <NavbarEndContent user={user} />
    </div>
  );
};

NavbarApp.displayName = 'NavbarApp';

export default NavbarApp;
