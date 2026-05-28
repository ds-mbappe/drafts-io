"use client"

import React, { useCallback, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@heroui/react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useInfiniteDiscoverDrafts } from '@/hooks/useDraft';
import DraftCardInLibrary from '@/components/card/DraftCardInLibrary';
import { FeedDraftsFallback } from '@/components/suspense/FeedDraftsFallback';
import { InfiniteScrollTrigger } from '@/components/feed/InfiniteScrollTrigger';
import { DraftProps } from '@/lib/types';
import { useTranslations } from 'next-intl';

const DiscoverPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const { items, hasMore, loadMore, isLoading, isValidating } = useInfiniteDiscoverDrafts(debouncedSearch);
  const t = useTranslations('feed');

  const clearSearch = useCallback(() => setSearch(''), []);

  return (
    <div className="w-full flex flex-col gap-5 mx-auto relative py-10 px-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{t('discoverTitle')}</h1>
        <p className="text-sm text-foreground-500">{t('discoverDescription')}</p>
      </div>

      <div className="relative w-full max-w-sm">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 pointer-events-none z-10" />
        <Input
          variant="secondary"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-8"
        />
        {search.length > 0 && (
          <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground z-10">
            <XIcon size={14} />
          </button>
        )}
      </div>

      {isLoading && items.length === 0 ? (
        <FeedDraftsFallback />
      ) : items.length ? (
        <>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
            {items.map((draft: DraftProps) => (
              <DraftCardInLibrary key={draft.id} draft={draft} likeToggled={() => {}} />
            ))}
          </div>
          <InfiniteScrollTrigger onIntersect={loadMore} hasMore={hasMore} isLoading={isValidating} />
        </>
      ) : (
        <p className="text-sm text-foreground-500">
          {search ? t('noSearchResults') : t('noDiscoverDrafts')}
        </p>
      )}
    </div>
  );
};

export default DiscoverPage;
