"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const DialogValidation = ({ trigger, title, description, primaryText, secondaryText, onPrimaryClick }: any) => {
  const [opened, setOpened] = useState(false)

  const changeOpenedState = () => {
    setOpened(!opened)
  }

  const onClickPrimaryButton = () => {
    setOpened(!opened)
    if (onPrimaryClick) {
      onPrimaryClick()
    }
  }

  return (
    <Dialog open={opened} onOpenChange={changeOpenedState}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{ title }</DialogTitle>
        </DialogHeader>

        <div className="w-full h-full">
          <span className="text-sm text-muted-foreground">
            { description }
          </span>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-center gap-2">
            <Button asChild variant={"ghost"} className='cursor-pointer' onClick={changeOpenedState}>
              <div>
                { secondaryText }
              </div>
            </Button>

            <Button asChild variant={"destructive"} className='cursor-pointer' onClick={onClickPrimaryButton}>
              <div>
                { primaryText }
              </div>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}