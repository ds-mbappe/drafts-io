import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import type { NavbarLinkItem, ThemeOption } from './types';

export const APP_HOME_ROUTE = '/app';

export const CENTER_NAV_ITEMS: NavbarLinkItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'drafts', label: 'Drafts', href: APP_HOME_ROUTE },
];

export const THEME_OPTIONS: ThemeOption[] = [
  { key: 'light', label: 'Light', icon: SunIcon },
  { key: 'dark', label: 'Dark', icon: MoonIcon },
  { key: 'system', label: 'System', icon: LaptopIcon },
];
