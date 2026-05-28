"use client"

import React, { useState } from 'react';
import { Input } from '@heroui/react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useSavedDrafts } from '@/hooks/useDraft';
import DraftCardInLibrary from '@/components/card/DraftCardInLibrary';
import { FeedDraftsFallback } from '@/components/suspense/FeedDraftsFallback';
import { DraftProps } from '@/lib/types';
import { useTranslations } from 'next-intl';

const Saved = () => {
  const { data, mutate, isLoading } = useSavedDrafts();
  const [search, setSearch] = useState('');
  const t = useTranslations('feed');

  const filtered = search.trim()
    ? data?.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
    : data;

  const onLikeToggled = async (draftId: string) => {
    await mutate(
      (current?: DraftProps[]) =>
        current?.map((d) =>
          d.id === draftId ? { ...d, hasLiked: !d.hasLiked } : d
        ),
      { revalidate: false },
    );
  };

  const onBookmarkToggled = async (draftId: string) => {
    await mutate(
      (current?: DraftProps[]) => current?.filter((d) => d.id !== draftId),
      { revalidate: false },
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 mx-auto relative py-10 px-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{t('savedTitle')}</h1>
        <p className="text-sm text-foreground-500">{t('savedDescription')}</p>
      </div>

      <div className="relative w-full max-w-sm">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 pointer-events-none z-10" />
        <Input
          variant="secondary"
          placeholder={t('searchSavedPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-8"
        />
        {search.length > 0 && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground z-10"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      {isLoading ? (
        <FeedDraftsFallback />
      ) : filtered?.length ? (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((draft: DraftProps) => (
            <DraftCardInLibrary
              key={draft.id}
              draft={draft}
              likeToggled={() => onLikeToggled(draft.id)}
              bookmarkToggled={() => onBookmarkToggled(draft.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-foreground-500">
          {search ? t('noSavedSearchResults') : t('noSavedDrafts')}
        </p>
      )}
    </div>
  );
};

export default Saved;
