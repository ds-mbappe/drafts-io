"use client";

import 'katex/dist/katex.min.css';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { PenToolIcon } from 'lucide-react';
import DocumentCard from '@/components/card/DocumentCard';
import { Button, Tabs, Tab } from "@heroui/react";
import { useLatestDocuments } from '@/hooks/useDocument';
import { LatestDocumentsFallback } from '@/components/suspense/LatestDocumentsFallback';
import { DocumentCardTypeprops } from '@/lib/types';

export default function App() {
  const { documents } = useLatestDocuments()

  return (
    <div className="w-full flex flex-col overflow-y-auto relative">
      <div className="w-full mx-auto relative flex cursor-text flex-col z-[1] flex-1 px-4 pt-10 pb-5">
        <Tabs
          key="tabs"
          color="primary"
          variant="bordered"
          aria-label="Tabs"
        >
          <Tab key="latest" title={`Discover`} className="w-full flex flex-col gap-4">
            <Suspense fallback={<LatestDocumentsFallback />}>
              {documents?.length ?
                <div className="w-full flex flex-col gap-4 md:!grid md:!grid-cols-2">
                  {
                    documents?.map((document: DocumentCardTypeprops, index: number) => {
                      return <DocumentCard key={index} document={document} />
                    })
                  }
                </div> :
                <p className="text-sm font-normal text-foreground-500">
                  {`There are no public drafts for the moment, come back later !`}
                </p>
              }
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
        {'New draft'}
      </Button>
    </div>
  )
}