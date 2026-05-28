import { BookTextIcon, CircleHelpIcon, CircleUserRoundIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import type { MenuItem } from './types';

export const buildMenuItems = ({
  onOpenProfile,
  onGoToLibrary,
  onLogout,
}: {
  onOpenProfile: () => void;
  onGoToLibrary: () => void;
  onLogout: () => void;
}): MenuItem[] => [
  { key: 'profile', label: 'Profile', icon: CircleUserRoundIcon, onPress: onOpenProfile },
  { key: 'library', label: 'My Library', icon: BookTextIcon, onPress: onGoToLibrary },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
  { key: 'help_and_feedback', label: 'Help & Feedback', icon: CircleHelpIcon },
  { key: 'logout', label: 'Log Out', danger: false, className: 'text-danger', icon: LogOutIcon, onPress: onLogout },
];
