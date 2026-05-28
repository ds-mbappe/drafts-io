"use client"

import React from 'react';
import { useInfiniteRecentlyRead } from '@/hooks/useDraft';
import DraftCardInLibrary from '@/components/card/DraftCardInLibrary';
import { FeedDraftsFallback } from '@/components/suspense/FeedDraftsFallback';
import { InfiniteScrollTrigger } from '@/components/feed/InfiniteScrollTrigger';
import { DraftProps } from '@/lib/types';

const RecentlyRead = () => {
  const { items, hasMore, loadMore, isLoading, isValidating } = useInfiniteRecentlyRead();

  return (
    <div className="w-full flex flex-col gap-5 mx-auto relative py-10 px-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Recently read</h1>
        <p className="text-sm text-foreground-500">
          Drafts you have opened, most recent first.
        </p>
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
          No drafts read yet. Open any draft and it will appear here.
        </p>
      )}
    </div>
  );
};

export default RecentlyRead;
