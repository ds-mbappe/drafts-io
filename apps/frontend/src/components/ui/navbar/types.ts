import { BaseUser } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

export type UserAwareProps = {
  user?: BaseUser;
};

export type NavbarAppProps = UserAwareProps;

export type NavbarLinkItem = {
  key: string;
  label: string;
  href: string;
};

export type ThemeKey = 'light' | 'dark' | 'system';

export type ThemeOption = {
  key: ThemeKey;
  label: string;
  icon: LucideIcon;
};

export type MenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
  className?: string;
  danger?: boolean;
};
