'use client';

import { SearchControls } from './SearchControls';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export const AppActions = ({ onOpenSearch }: { onOpenSearch: () => void }) => {
  return (
    <>
      <NotificationBell />
      <SearchControls onOpenSearch={onOpenSearch} />
    </>
  );
};
