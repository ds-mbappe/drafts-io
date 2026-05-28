"use client";

import 'katex/dist/katex.min.css';

import React, { useCallback, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useNewDraftStore } from '@/stores/newDraftStore';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { Button, Input, Skeleton } from "@heroui/react";
import DraftCardInLibrary from '@/components/card/DraftCardInLibrary';
import Carousel from '@/components/ui/Carousel';
import { useTrending, useInfiniteDiscoverDrafts, useInfiniteFollowingDrafts } from '@/hooks/useDraft';
import { DraftProps } from '@/lib/types';
import { useTranslations } from 'next-intl';

function TrendingCarousel({ search }: { search: string }) {
  const { data, isLoading } = useTrending(8);
  const t = useTranslations('feed');

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="rounded-xl shrink-0 w-[320px] h-[220px]" />
        ))}
      </div>
    );
  }

  if (!data?.items?.length || search) return null;

  return (
    <Carousel title={t('trendingTitle')} seeAllHref="/app/trending">
      {data.items.map((draft: DraftProps) => (
        <DraftCardInLibrary key={draft.id} draft={draft} likeToggled={() => {}} />
      ))}
    </Carousel>
  );
}

function DiscoverCarousel({ search }: { search: string }) {
  const { items, isLoading } = useInfiniteDiscoverDrafts(search);
  const t = useTranslations('feed');

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-base">{t('discoverTitle')}</p>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="rounded-xl shrink-0 w-[320px] h-[220px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-base">{t('discoverTitle')}</p>
        <p className="text-sm text-foreground-500">{t('noDraftsAvailable')}</p>
      </div>
    );
  }

  return (
    <Carousel title={t('discoverTitle')} seeAllHref="/app/discover">
      {items.map((draft: DraftProps) => (
        <DraftCardInLibrary key={draft.id} draft={draft} likeToggled={() => {}} />
      ))}
    </Carousel>
  );
}

function FollowingCarousel({ search }: { search: string }) {
  const { items, isLoading } = useInfiniteFollowingDrafts(search);
  const t = useTranslations('feed');

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-base">{t('followingTitle')}</p>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="rounded-xl shrink-0 w-[320px] h-[220px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-base">{t('followingTitle')}</p>
        <p className="text-sm text-foreground-500">{t('notFollowingAnybody')}</p>
      </div>
    );
  }

  return (
    <Carousel title={t('followingTitle')} seeAllHref="/app/following">
      {items.map((draft: DraftProps) => (
        <DraftCardInLibrary key={draft.id} draft={draft} likeToggled={() => {}} />
      ))}
    </Carousel>
  );
}

export default function App() {
  const { open: openNewDraft } = useNewDraftStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const t = useTranslations('feed');

  const clearSearch = useCallback(() => setSearch(''), []);

  return (
    <div className="w-full flex flex-col overflow-y-auto relative">
      <div className="w-full mx-auto relative flex flex-col z-1 flex-1 px-4 pt-10 pb-10 gap-10">

        <div className="flex w-full items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 pointer-events-none z-10" />
            <Input
              variant="secondary"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8"
            />
            {search.length > 0 && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground z-10"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
          <Button variant="primary" className="hover:scale-105 transition-all shrink-0" onPress={openNewDraft}>
            <PlusIcon size={20} />
            {t('newDraft')}
          </Button>
        </div>

        <TrendingCarousel search={debouncedSearch} />
        <DiscoverCarousel search={debouncedSearch} />
        <FollowingCarousel search={debouncedSearch} />
      </div>
    </div>
  );
}
