"use client";

import 'katex/dist/katex.min.css';
import Link from 'next/link';
import React, { Suspense, useContext } from 'react';
import { PenToolIcon } from 'lucide-react';
import { Button, Tabs, Tab } from "@heroui/react";
import { useLatestDrafts } from '@/hooks/useDocument';
import { LatestDocumentsFallback } from '@/components/suspense/LatestDocumentsFallback';
import { DocumentCardTypeprops } from '@/lib/types';
import { NextSessionContext } from '@/contexts/SessionContext';
import DraftCardInLibrary from '@/components/card/DraftCardInLibrary';

const DiscoverContent = () => {
  const { session } = useContext(NextSessionContext);
  const token = session?.accessToken;
  
  const { drafts, isLoading } = useLatestDrafts(token);

  if (isLoading || drafts === undefined) {
    return null;
  }
  
  return drafts?.length ? (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {drafts.map((draft: DocumentCardTypeprops) => (
        <DraftCardInLibrary key={draft.id} draft={draft} />
      ))}
    </div>
  ) : (
    <p>No stories available</p>
  );
};

export default function App() {
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
            <Suspense fallback={<LatestDocumentsFallback />}>
              <DiscoverContent />
            </Suspense>
          </Tab>

          <Tab key="for_you" title={`Following`} className="flex flex-col gap-4">
            <p className="text-sm font-normal text-foreground-500">
              {`You are currently not following anybody. Start following people to see their published drafts`}
            </p>
          </Tab>
        </Tabs>
      </div>

      <Button
        as={Link}
        color="primary"
        href="/app/new_draft"
        startContent={<PenToolIcon />}
        className="fixed bottom-5 right-5 z-20 hover:scale-110"
      >
        {'New story'}
      </Button>
    </div>
  )
}