"use client"

import React from 'react';
import { useInfiniteTrending } from '@/hooks/useDraft';
import DraftCardInLibrary from '@/components/card/DraftCardInLibrary';
import { FeedDraftsFallback } from '@/components/suspense/FeedDraftsFallback';
import { InfiniteScrollTrigger } from '@/components/feed/InfiniteScrollTrigger';
import { DraftProps } from '@/lib/types';
import { useTranslations } from 'next-intl';

const TrendingPage = () => {
  const { items, hasMore, loadMore, isLoading, isValidating } = useInfiniteTrending();
  const t = useTranslations('feed');

  return (
    <div className="w-full flex flex-col gap-5 mx-auto relative py-10 px-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{t('trendingTitle')}</h1>
        <p className="text-sm text-foreground-500">{t('trendingDescription')}</p>
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
        <p className="text-sm text-foreground-500">{t('noTrendingDrafts')}</p>
      )}
    </div>
  );
};

export default TrendingPage;
