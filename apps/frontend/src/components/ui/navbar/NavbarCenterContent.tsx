'use client';

import { clsx as cn } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CENTER_NAV_ITEMS } from './constants';

const NavbarCenterContent = ({ className }: { className?: string }) => {
  const route = usePathname();

  return (
    <div className={cn('flex items-center gap-8', className)}>
      {CENTER_NAV_ITEMS.map(({ key, label, href }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route === href ? 'text-primary' : 'text-foreground-500',
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

export default NavbarCenterContent;
