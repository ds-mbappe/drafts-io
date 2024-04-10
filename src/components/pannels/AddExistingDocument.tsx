"use client"

// import bcrypt from 'bcrypt';
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
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [encrytedPassword, setEncryptedPassword] = useState("")
  const [docPassword, setDocPassword] = useState("")

  const onAddDocument = async () => {
    const res = await fetch(`/api/document/${docId}/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()

    // 6612c2a28bc74e89b7668011

    if (!res.ok) {
      toast(`Error`, {
        description: `Failed to get document status.`,
        duration: 5000,
        important: true,
      })
    }
    if (data?.private) {
      setShowPasswordField(true)
    }
    setEncryptedPassword(data?.password)
  }

  const onUnlockDocument = async () => {
    const bcrypt = require("bcrypt")
    const isPasswordCorrect = await bcrypt.compare(docPassword, encrytedPassword)
    console.log(isPasswordCorrect)
    // setDialogOpen(false)
  }

  const changeDialogOpenState = () => {
    setDialogOpen(!dialogOpen)
    if (!dialogOpen) {
      resetStates()
    }
  }

  const resetStates = () => {
    setDocId("")
    setDocPassword("")
    setEncryptedPassword("")
    setShowPasswordField(false)
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
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="doc-id" className="text-right">DocumentID</Label>
              <Input id="doc-id" autoComplete="new-password" placeholder="The id of the document you want to import" value={docId} onChange={(e) => setDocId(e.target.value)} />
            </div>

            {showPasswordField ?
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground font-normal">
                  The document you are trying to access is private, please enter it's password to unlock and import it.
                </p>

                <div className="flex items-center gap-4">
                  <Label htmlFor="doc-password" className="text-left">Password</Label>
                  <Input id="doc-password" type="password" autoComplete="new-password" placeholder="Document password" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} />
                </div>
              </div> : <></>
            }
          </div>
        <DialogFooter>
          {showPasswordField ?
            <Button asChild variant={"default"} className='cursor-pointer' onClick={onUnlockDocument}>
              <div>
                Unlock document
              </div>
            </Button>
            :
            <Button asChild variant={"default"} className='cursor-pointer' onClick={onAddDocument}>
              <div>
                Add document
              </div>
            </Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
