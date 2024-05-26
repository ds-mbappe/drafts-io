"use client"

import React, { startTransition, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@clerk/clerk-react';
import { toast } from "sonner"

export const CreateNewDocument = ({ onDocumentSaved }: any) => {
  const router = useRouter();
  const { user } = useUser();

  const [dialogOpen, setDialogOpen] = useState(false)
  const [docName, setDocName] = useState("")
  const [docPassword, setDocPassword] = useState("")
  const [docPrivate, setDocPrivate] = useState(false)

  const handleSaveData = async () => {
    let formData = {
      name: docName,
      creator_id: user?.id,
      can_edit: undefined,
      team_id: undefined,
      private: docPrivate,
      encrypted_password: docPassword,
      content: "",
    }

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error("Failed to create document.")
    }

    startTransition(() => {
      // Force a cache invalidation and redirect to the new document.
      router.refresh();
      router.push(`/app/${data?.document?._id}`)
    });


    toast(`Document created`, {
      description: `Successfully created document ${docName}.`,
      duration: 5000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
    onDocumentSaved()
  };

  const submitAndCloseDialog = () => {
    handleSaveData()
    setDialogOpen(false)
  }

  const changeDialogOpenState = () => {
    setDialogOpen(!dialogOpen)
    if (!dialogOpen) {
      resetStates()
    }
  }

  const resetStates = () => {
    setDocName("")
    setDocPassword("")
    setDocPrivate(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={changeDialogOpenState}>
      <DialogTrigger>
        <Button asChild variant={"outline"} className='w-full gap-4'>
          <span>
            {'Create a new document'}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New document</DialogTitle>

          <DialogDescription>
            Set your new document properties here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-title" className="text-right">Title</Label>

            <Input id="doc-title" autoComplete="new-password" placeholder="Document title" className="col-span-3" value={docName} onChange={(e) => setDocName(e.target.value)} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-private" className="text-right">Private</Label>

            <Switch id="doc-private" checked={docPrivate} onCheckedChange={() => setDocPrivate(!docPrivate)} className="col-span-3" />
          </div>
          { docPrivate ?
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc-password" className="text-right">Password</Label>
              
              <Input id="doc-password" autoComplete="new-password" type="password" placeholder="Document password" className="col-span-3" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} />
            </div> : <></>
          }
        </div>

        <DialogFooter>
          <Button asChild variant={"default"} className='cursor-pointer' onClick={submitAndCloseDialog}>
            <div>
              Create
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
