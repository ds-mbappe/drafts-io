'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppActions } from './AppActions';
import { AppModals } from './AppModals';
import { HomeActions } from './HomeActions';
import type { UserAwareProps } from './types';

const NavbarEndContent = ({ user: _ }: UserAwareProps) => {
  const route = usePathname();
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const onOpenChangeSearch = () => setIsOpenSearch(v => !v);

  const isHomePage = route === '/';

  return (
    <>
      <div className="flex items-center gap-1">
        {isHomePage ? (
          <HomeActions />
        ) : (
          <AppActions onOpenSearch={onOpenChangeSearch} />
        )}
      </div>

      {!isHomePage && (
        <AppModals
          isOpenSearch={isOpenSearch}
          onOpenChangeSearch={onOpenChangeSearch}
        />
      )}
    </>
  );
};

export default NavbarEndContent;
