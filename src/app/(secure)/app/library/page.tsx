"use client"

import { Button, Spinner } from "@heroui/react";
import React, { useContext } from 'react';
import { useLibraryDocuments } from '@/hooks/useDocument';
import { NextSessionContext } from '@/contexts/SessionContext';
import DocumentCardInLibrary from '@/components/card/DocumentCardInLibrary';
import Link from "next/link";
import { PlusIcon } from "lucide-react";

const Library = () => {
  const { session } = useContext(NextSessionContext);
  const userId = session?.user?.id;
  const { documents, isLoading } = useLibraryDocuments(userId);

  return (

    <div className="w-full flex flex-col gap-5 mx-auto relative py-10 px-5">
      <p className="text-sm font-normal text-foreground-500">
        {`This is the list of all the drafts you have created, wheter you published them or not. You can manage them (edit, publish, delete) right from here.`}
      </p>

      {isLoading ?
        <div className="w-full h-full my-12 flex items-center justify-center">
          <Spinner size="lg" />
        </div>:
        <>
          { documents?.length ?
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 pb-10">
              {
                documents?.map((document: any, index: number) => {
                  return <DocumentCardInLibrary key={index} document={document} />
                })
              }
            </div> :
            <p className="text-sm font-normal text-foreground-500">
              {`You have not created a draft yet, start by clicking the button at the bottom right of your screen.`}
            </p>
          }
        </>
      }

      <Button
        as={Link}
        color="primary"
        href="/app/new_draft"
        startContent={<PlusIcon />}
        className="fixed bottom-10 right-10 z-20 hover:scale-110"
      >
        {'New draft'}
      </Button>
    </div>
  )
}

export default Library