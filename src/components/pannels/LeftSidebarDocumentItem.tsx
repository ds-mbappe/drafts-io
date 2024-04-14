"use client"

import React from 'react'
import { Button } from '../ui/button'
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LockClosedIcon } from '@radix-ui/react-icons'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const LeftSidebarDocumentItem = ({ document }: any) => {
  const router = useRouter()

  return (
    <Button asChild variant={"ghost"}>
      <Link className="w-full flex justify-between cursor-pointer" href={`/app/${document?._id}`}>
        <div className="w-full max-w-[175px] flex gap-4">
          {document.name}
          {/* {document.private ?
            <LockClosedIcon /> : <></>
          } */}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost" }), "h-full items-center border-none p-0")}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem
              // onSelect={() => setShowEditSheet(true)}
              className="flex cursor-pointer items-center"
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              // onSelect={() => setShowDeleteAlert(true)}
              className="flex cursor-pointer items-center text-destructive focus:text-destructive hover:!bg-red-100"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Link>
  </Button>
  )
}
