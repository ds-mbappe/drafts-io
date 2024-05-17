import React, { memo, useEffect, useState } from 'react'
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { FileClock } from 'lucide-react';
import HistoryDropdownItem from './HistoryDropdownItem';

const HistoryDropdown = memo((data: any) => {

  const renderDate = (date: string | number | Date) => {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
  
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
  
    return `${day}-${month}-${year}, at ${hours}:${minutes}`
  }

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button asChild size={"sm"} variant={"ghost"} title="Document history">
            <FileClock />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[300px]">
          <DropdownMenuLabel>Version history</DropdownMenuLabel>

          <p className="text-sm text-muted-foreground px-2 py-1.5">
            {`These are the latest versions of your document. Click on a specific version to preview it, and eventually rollback to the said version.`}
          </p>

          <DropdownMenuSeparator />

          <div className="flex flex-col max-h-[300px] overflow-y-auto">
            {
              data?.historyData?.versions?.length ?
              <>
                {
                  data?.historyData?.versions?.sort(function(a: any, b: any) {
                    return b?.version - a?.version
                  })?.map((version: any) =>
                    <DialogTrigger asChild key={version.date}>
                      <div className="flex flex-col gap-1.5 cursor-pointer hover:bg-muted rounded-sm px-2 py-1.5 items-start">
                        <p className="text-base font-semibold">
                          {`Version - ${version?.version}`}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {renderDate(version?.date)}
                        </p>
                      </div>
                    </DialogTrigger>
                  )
                }
              </> :
              <>
                <p className="text-sm text-muted-foreground px-2 py-1.5">
                  {`There are no previous versions of your document. Start editing to automatically create a version.`}
                </p>
              </>
            }
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently
            delete this file from our servers?
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
});

HistoryDropdown.displayName = 'HistoryDropdown'

export default HistoryDropdown