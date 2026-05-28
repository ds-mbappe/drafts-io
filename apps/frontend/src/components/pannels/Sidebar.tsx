'use client';

import React, { memo, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, Separator } from '@heroui/react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  BookmarkIcon,
  BookOpenTextIcon,
  BookTextIcon,
  CircleHelpIcon,
  ClockIcon,
  GlobeIcon,
  HomeIcon,
  LayoutListIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PinIcon,
  PinOffIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon,
} from 'lucide-react';
import { clsx as cn } from 'clsx';
import { useTranslations } from 'next-intl';
import { NextSessionContext } from '@/contexts/SessionContext';
import { useSidebarStore } from '@/stores/sidebarStore';
import ProfileModal from './ProfileModal';

const SIDEBAR_WIDTH = 260;
const GAP = 8;

const FLOAT_STYLE = { top: 44 + GAP, bottom: GAP, left: GAP, borderRadius: 12 };
const FLOAT_HIDDEN = { ...FLOAT_STYLE, left: -(SIDEBAR_WIDTH + GAP * 2) };

// ---------------------------------------------------------------------------

const NavItem = ({
  icon, label, active, danger, onClick, href,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  href?: string;
}) => {
  const cls = cn(
    'w-full flex gap-2.5 px-3 py-2 items-center rounded-xl cursor-pointer text-sm font-medium transition-colors',
    active
      ? 'bg-primary/10 text-primary'
      : danger
        ? 'text-foreground-500 hover:text-danger hover:bg-foreground-100'
        : 'text-foreground-500 hover:text-foreground hover:bg-foreground-100',
  );
  if (href) return <Link href={href} className={cls} onClick={onClick}>{icon}{label}</Link>;
  return <div className={cls} onClick={onClick}>{icon}{label}</div>;
};

// ---------------------------------------------------------------------------

const SidebarContent = ({
  onPin,
  isDocked,
  onClose,
  onOpenProfile,
}: {
  onPin: () => void;
  isDocked: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { session } = useContext(NextSessionContext);
  const t = useTranslations('nav');

  const themeConfig = {
    light:  { icon: <SunIcon size={16} />,     label: t('lightMode'), next: 'dark'   },
    dark:   { icon: <MoonIcon size={16} />,    label: t('darkMode'),  next: 'system' },
    system: { icon: <MonitorIcon size={16} />, label: t('system'),    next: 'light'  },
  } as const;

  const current = (theme as keyof typeof themeConfig) ?? 'system';
  const { icon: themeIcon, label: themeLabel, next } = themeConfig[current] ?? themeConfig.system;

  const nav = (href: string) => () => {
    router.push(href);
    onClose();
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 pt-4 pb-2 shrink-0">
        <p className="text-xs font-semibold text-foreground-400 uppercase tracking-wider">{t('menu')}</p>
        <button
          onClick={onPin}
          title={isDocked ? t('undockSidebar') : t('dockSidebar')}
          className="p-1 rounded-lg text-foreground-400 hover:text-foreground hover:bg-foreground-100 transition-colors"
        >
          {isDocked ? <PinOffIcon size={14} /> : <PinIcon size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        {/* Profile */}
        <div
          className="flex items-center gap-2.5 p-2.5 mb-2 rounded-xl border border-divider cursor-pointer hover:bg-foreground-100 transition-colors"
          onClick={onOpenProfile}
        >
          <Avatar color="accent" size="sm">
            <Avatar.Image src={session?.user?.avatar ?? undefined} />
            <Avatar.Fallback>{session?.user?.firstname?.split('')?.[0]?.toUpperCase()}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="font-semibold text-sm truncate">
              {`${session?.user?.firstname ?? ''} ${session?.user?.lastname ?? ''}`.trim()}
            </p>
            <p className="text-foreground-500 text-xs truncate">{session?.user?.email}</p>
          </div>
        </div>

        <NavItem href="/app" icon={<HomeIcon size={16} />} label={t('home')} active={pathname === '/app'} onClick={onClose} />
        <NavItem
          icon={<BookTextIcon size={16} />}
          label={t('myLibrary')}
          active={pathname === '/app/library'}
          onClick={nav('/app/library')}
        />
        <NavItem
          icon={<BookmarkIcon size={16} />}
          label={t('saved')}
          active={pathname === '/app/saved'}
          onClick={nav('/app/saved')}
        />
        <NavItem
          icon={<ClockIcon size={16} />}
          label={t('recentlyRead')}
          active={pathname === '/app/recently-read'}
          onClick={nav('/app/recently-read')}
        />

        <Separator className="my-1" />

        <NavItem
          icon={<BookOpenTextIcon size={16} />}
          label={t('trending')}
          active={pathname === '/app/trending'}
          onClick={nav('/app/trending')}
        />
        <NavItem
          icon={<GlobeIcon size={16} />}
          label={t('discover')}
          active={pathname === '/app/discover'}
          onClick={nav('/app/discover')}
        />
        <NavItem
          icon={<UsersIcon size={16} />}
          label={t('following')}
          active={pathname === '/app/following'}
          onClick={nav('/app/following')}
        />
        <NavItem
          icon={<LayoutListIcon size={16} />}
          label={t('topics')}
          active={pathname === '/app/topics'}
          onClick={nav('/app/topics')}
        />

        <Separator className="my-1" />

        <NavItem
          icon={<SettingsIcon size={16} />}
          label={t('settings')}
          active={pathname === '/app/settings'}
          onClick={nav('/app/settings')}
        />
        <NavItem icon={<CircleHelpIcon size={16} />} label={t('help')} onClick={onClose} />
        <NavItem
          icon={themeIcon}
          label={themeLabel}
          onClick={() => setTheme(next)}
        />

        <Separator className="my-1" />

        <NavItem
          icon={<LogOutIcon size={16} />}
          label={t('signOut')}
          danger
          onClick={() => signOut({ callbackUrl: '/account/sign-in' })}
        />
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------

const Sidebar = memo(() => {
  const { mode, setMode, toggle, scheduleClose, cancelClose } = useSidebarStore();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const onOpenProfile = () => setIsProfileOpen(true);
  const onOpenChangeProfile = (v: boolean) => setIsProfileOpen(v);

  const isFloating = mode === 'floating';
  const isDocked = mode === 'docked';

  // Close floating sidebar on route change.
  useEffect(() => {
    if (mode === 'floating') setMode('hidden');
  }, [pathname]);

  // Auto-undock when the viewport shrinks below 768 px.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches && mode === 'docked') setMode('hidden');
    };
    mq.addEventListener('change', handler);
    // Immediate check in case the component mounts on a small screen.
    if (mq.matches && mode === 'docked') setMode('hidden');
    return () => mq.removeEventListener('change', handler);
  }, [mode, setMode]);

  const handleClose = () => {
    if (mode === 'floating') setMode('hidden');
  };

  const sharedContentProps = { onPin: toggle, isDocked, onClose: handleClose, onOpenProfile };

  return (
    <>
      {/* ── DOCKED: in-flow flex child ── */}
      <AnimatePresence>
        {isDocked && (
          <motion.div
            key="docked"
            className="shrink-0 h-full border-r border-divider bg-content1 flex flex-col overflow-hidden z-20"
            initial={{ width: 0 }}
            animate={{ width: SIDEBAR_WIDTH }}
            exit={{ width: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <SidebarContent {...sharedContentProps} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING: fixed overlay ── */}
      {mode === 'hidden' && (
        <div
          className="fixed left-0 top-0 h-dvh w-2 z-30"
          onMouseEnter={() => setMode('floating')}
        />
      )}

      <AnimatePresence>
        {isFloating && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[59]"
            style={{ top: 44 }}
            initial={{ opacity: 0 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            onClick={() => setMode('hidden')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFloating && (
          <motion.div
            key="floating"
            className="fixed z-[60] flex flex-col overflow-hidden border border-divider bg-content1 shadow-xl shadow-black/10"
            style={{ width: SIDEBAR_WIDTH }}
            initial={FLOAT_HIDDEN}
            animate={FLOAT_STYLE}
            exit={FLOAT_HIDDEN}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <SidebarContent {...sharedContentProps} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile modal — rendered once, shared between both modes */}
      <ProfileModal dialogOpen={isProfileOpen} changeDialogOpenState={onOpenChangeProfile} />
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
