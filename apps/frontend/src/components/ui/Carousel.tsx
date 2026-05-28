"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CarouselProps {
  title?: string;
  seeAllHref?: string;
  children: React.ReactNode;
  itemWidth?: number;
  gap?: number;
}

const Carousel = ({
  title,
  seeAllHref,
  children,
  itemWidth = 320,
  gap = 16,
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('feed');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'right' ? itemWidth + gap : -(itemWidth + gap),
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {(title || seeAllHref) && (
        <div className="flex items-center justify-between px-1">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {seeAllHref && (
            <Link href={seeAllHref} className="text-sm text-primary hover:underline">
              {t('seeAll')}
            </Link>
          )}
        </div>
      )}

      <div className="relative group">
        {canScrollLeft && (
          <Button
            isIconOnly
            size="sm"
            variant="secondary"
            onPress={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeftIcon size={16} />
          </Button>
        )}

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {React.Children.map(children, (child) => (
            <div className="shrink-0" style={{ width: itemWidth }}>
              {child}
            </div>
          ))}
        </div>

        {canScrollRight && (
          <Button
            isIconOnly
            size="sm"
            variant="secondary"
            onPress={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRightIcon size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Carousel;
