"use client"

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LockClosedIcon } from '@radix-ui/react-icons'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash, Loader2, SquarePen, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { DialogValidation } from '../ui/DialogValidation';
import { useUser } from '@clerk/clerk-react';
import Icon from '../ui/Icon';

export const LeftSidebarDocumentItem = ({ document, onDocumentRemoved, onDocumentDeleted }: any) => {
  const router = useRouter()
  const { user } = useUser();

  const navigateToDocument = () => {
    router.push(`/app/${document?._id}`)
  }

  const onTrashClicked = () => {
    if (document?.creator_id === user?.id) {
      onDocumentDeleted(document)
    } else {
      onDocumentRemoved(document)
    }
  }

  return (
    <div className="w-full cursor-pointer hover:bg-muted-foreground/10 px-5">
      <div
        className="w-full h-10 flex gap-4 items-center justify-between"
        onClick={navigateToDocument}
      >
        <p className="line-clamp-1">
          {document.name}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button asChild size={"sm"} variant={"ghost"} onClick={(e) => e.stopPropagation()}>
              <div>
                <Icon name="EllipsisVertical" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <div
              onClick={(e) => e.stopPropagation()}
              className="cursor-pointer flex items-center gap-2 p-1.5 text-sm font-medium text-black hover:bg-neutral-100 hover:text-neutral-800 text-left bg-transparent w-full rounded"
            >
              <Icon name="SquarePen" />
              Edit document settings
            </div>

            <DropdownMenuSeparator />

            <div
              onClick={(e) => e.stopPropagation()}
              className="cursor-pointer flex items-center gap-2 p-1.5 text-sm font-medium text-left bg-transparent w-full rounded text-red-500 hover:bg-red-500 bg-opacity-10 hover:bg-opacity-20 hover:text-red-500"
            >
              <Icon name="Trash2" />
              Delete document
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    // <Button asChild variant={"ghost"}>
    //   <HoverCard openDelay={100} closeDelay={100}>

    //     <HoverCardContent asChild side="bottom" className="w-fit p-1" align="end">
    //       <div className="flex">
    //         <div className="p-1.5 hover:bg-muted-foreground/10 rounded cursor-pointer">
    //           <SquarePen />
    //         </div>

    //         <DialogValidation
    //           trigger={
    //             <div className="p-1.5 hover:bg-destructive/10 text-destructive rounded cursor-pointer">
    //               <Trash2 />
    //             </div>
    //           }
    //           title={document?.creator_id === user?.id ? "Delete document" : "Remove Document"}
    //           description={
    //             document?.creator_id === user?.id ?
    //               "If you delete this document, other users who have added it will no longer be able to access it" :
    //               "If you remove this document, you will need to import it again in the future."
    //           }
    //           secondaryText="Cancel"
    //           primaryText={document?.creator_id === user?.id ? "Delete" : "Remove"}
    //           onPrimaryClick={onTrashClicked}
    //         />
    //       </div>
    //     </HoverCardContent>
    //   </HoverCard>
    // </Button>
  )
}
