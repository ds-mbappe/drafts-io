"use client"

import React, { startTransition, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "@radix-ui/react-icons";
import { SearchIcon } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@clerk/clerk-react';
import { toast } from "sonner"

export const AddExistingDocument = ({ onDocumentAdded }: any) => {
  const router = useRouter();
  const { user } = useUser();

  const [dialogOpen, setDialogOpen] = useState(false)
  const [docId, setDocId] = useState("")

  const onAddDocument = () => {
    setDialogOpen(false)
  }

  const changeDialogOpenState = () => {
    setDialogOpen(!dialogOpen)
    if (!dialogOpen) {
      resetStates()
    }
  }

  const resetStates = () => {
    setDocId("")
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={changeDialogOpenState}>
      <DialogTrigger>
        <Button asChild variant={"outline"} className='w-full gap-4'>
          <div>
            <SearchIcon />
            Add existing document
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import document</DialogTitle>
          <DialogDescription>
            Enter the document ID to import it
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-id" className="text-right">Doc ID</Label>
            <Input id="doc-id" autoComplete="new-password" placeholder="The id of the document you want to import" className="col-span-3" value={docId} onChange={(e) => setDocId(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button asChild variant={"default"} className='cursor-pointer' onClick={onAddDocument}>
            <div>
              Add
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
