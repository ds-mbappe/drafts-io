"use client"

import { Spinner } from "@heroui/react";
import React, { useContext } from 'react';
import { useLibraryDocuments } from '@/hooks/useDocument';
import { NextSessionContext } from '@/contexts/SessionContext';
import DocumentCardInLibrary from '@/components/card/DocumentCardInLibrary';

const Library = () => {
  const { session } = useContext(NextSessionContext);
  const userId = session?.user?.id;
  const { documents, isLoading } = useLibraryDocuments(userId);

  return (
    <div className="w-full h-[calc(100vh-65px)] flex flex-col gap-5 max-w-[768px] 2xl:max-w-[1024px] mx-auto relative py-10">
      <p className="text-sm font-normal text-foreground-500">
        {`This is the list of all the documents you have created, wheter you published them or not. You can manage them (edit, publish, delete) right from here.`}
      </p>

      {isLoading ?
        <div className="w-full h-full my-12 flex items-center justify-center">
          <Spinner size="lg" />
        </div>:
        <>
          { documents?.length ?
            <div className="w-full flex flex-wrap gap-5 pb-10">
              {
                documents?.map((document: any, index: number) => {
                  return <DocumentCardInLibrary key={index} document={document} />
                })
              }
            </div> :
            <p className="text-sm font-normal text-foreground-500">
              {`You have not created a document yet, start by clicking the button at the bottom right of your screen.`}
            </p>
          }
        </>
      }
    </div>
  )
}

export default Library