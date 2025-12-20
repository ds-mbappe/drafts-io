"use client";

import 'katex/dist/katex.min.css';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { PenToolIcon } from 'lucide-react';
import { Button, Tabs, Tab } from "@heroui/react";
import FeedCards from '@/components/feed/FeedCards';
import { FeedDraftsFallback } from '@/components/suspense/FeedDraftsFallback';
import { useFeedDiscoverDrafts, useFeedFollowingDrafts } from '@/hooks/useDraft';

export default function App() {
  const { drafts: discoverDrafts, isLoading: isLoadingDiscover } = useFeedDiscoverDrafts();
  const { drafts: followingDrafts, isLoading: isLoadingFollowing } = useFeedFollowingDrafts();

  return (
    <div className="w-full flex flex-col overflow-y-auto relative">
      <div className="w-full mx-auto relative flex cursor-text flex-col z-1 flex-1 px-4 pt-10 pb-5">
        <Tabs
          key="tabs"
          color="primary"
          variant="bordered"
          aria-label="Tabs"
        >
          <Tab key="latest" title={`Discover`} className="w-full flex flex-col gap-4">
            <Suspense fallback={<FeedDraftsFallback />}>
              <FeedCards
                drafts={discoverDrafts}
                isLoading={isLoadingDiscover}
                emptyStateTitle="No drafts available."
              />
            </Suspense>
          </Tab>

          <Tab key="for_you" title={`Following`} className="flex flex-col gap-4">
            <Suspense fallback={<FeedDraftsFallback />}>
              <FeedCards
                drafts={followingDrafts}
                isLoading={isLoadingFollowing}
                emptyStateTitle="You are currently not following anybody. Start following people to see their published drafts."
              />
            </Suspense>
          </Tab>
        </Tabs>
      </div>

      <Button
        as={Link}
        color="primary"
        href="/app/new_draft"
        startContent={<PenToolIcon size={20} />}
        className="fixed bottom-5 right-5 z-20 hover:scale-110"
      >
        {'New Draft'}
      </Button>
    </div>
  )
}