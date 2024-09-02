"use client"

import moment from "moment";
import Link from 'next/link';
import React, {  } from 'react';
import { Chip } from "@nextui-org/react";

export const LeftSidebarDocumentItem = ({ document }: any) => {

  return (
    <>
      <Link href={`/app/${document?._id}`}>
        <div className='w-full px-4 py-2 rounded-md flex gap-1 hover:bg-foreground-100'>
          <div className='w-full flex flex-col'>
            <div className="flex flex-col">
              <p className="line-clamp-1 text-start font-semibold break-all">
                {document?.title}
              </p>
              
              <p className="line-clamp-1 text-foreground-500 text-sm">
                {'Updated '} {moment(document?.updatedAt).fromNow()}
              </p>
            </div>

            <Chip variant="bordered" size="sm">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">#</span>

                <p>{document?.topic}</p>
              </div>
            </Chip>
          </div>

          
        </div>
      </Link>
    </>
  )
}
