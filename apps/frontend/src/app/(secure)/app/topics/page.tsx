"use client"

import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Button, Chip, Input, Skeleton } from '@heroui/react';
import { CheckIcon, SearchIcon, XIcon } from 'lucide-react';
import { useDraftsByTopics, useTopics } from '@/hooks/useDraft';
import DraftCardInLibrary from '@/components/card/DraftCardInLibrary';
import { FeedDraftsFallback } from '@/components/suspense/FeedDraftsFallback';
import { DraftProps } from '@/lib/types';

const TopicsPage = () => {
  const { data: topics, isLoading: topicsLoading } = useTopics();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const { data: draftsData, isLoading: draftsLoading } = useDraftsByTopics(selectedTopics, debouncedSearch);


  const toggleTopic = (name: string) => {
    setSelectedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const hasActiveFilters = selectedTopics.length > 0;

  return (
    <div className="w-full flex flex-col gap-8 mx-auto relative py-10 px-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Topics</h1>
        <p className="text-sm text-foreground-500">
          Browse published drafts by topic.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-md">
            <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 pointer-events-none z-10" />
            <Input
              variant="secondary"
              placeholder="Search topics or drafts…"
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
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setSelectedTopics([])}
              className="text-foreground-500 shrink-0"
            >
              <XIcon size={14} />
              Clear filters
            </Button>
          )}
        </div>

        {topicsLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="rounded-full h-7 w-20" />
            ))}
          </div>
        ) : topics?.length ? (
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => {
              const isActive = selectedTopics.includes(t.name);
              return (
                <Chip
                  key={t.name}
                  size="md"
                  color={isActive ? 'accent' : 'default'}
                  variant={isActive ? "primary" : "soft"}
                  className={`cursor-pointer transition-all`}
                  onClick={() => toggleTopic(t.name)}
                >
                  {isActive && <CheckIcon size={12} className="mr-1 inline" />}
                  {t.name}
                  <span className={`ml-1 text-xs ${isActive ? 'opacity-70' : 'opacity-60'}`}>{t.count}</span>
                </Chip>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-foreground-500">No topics found.</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {draftsLoading ? (
          <FeedDraftsFallback />
        ) : draftsData?.items?.length ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
            {draftsData.items.map((draft: DraftProps) => (
              <DraftCardInLibrary
                key={draft.id}
                draft={draft}
                likeToggled={() => {}}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground-500">No drafts match your filters.</p>
        )}
      </div>
    </div>
  );
};

export default TopicsPage;
