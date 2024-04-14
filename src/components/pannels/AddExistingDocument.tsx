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
import { toast } from "sonner";

export const AddExistingDocument = ({ onDocumentAdded }: any) => {
  const router = useRouter();
  const { user } = useUser();

  const [dialogOpen, setDialogOpen] = useState(false)
  const [docId, setDocId] = useState("")
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [encrytedPassword, setEncryptedPassword] = useState("")
  const [docPassword, setDocPassword] = useState("")
  const [holdersId, setHoldersId] = useState([])

  const onAddDocument = async () => {
    const res = await fetch(`/api/document/${docId}/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()

    // 66199a8c89780e4057b166da
    if (!res.ok) {
      toast(`Error`, {
        description: `Failed to get document status.`,
        duration: 5000,
        important: true,
      })
    } else {
      if (data?.holders_id?.includes(user?.id)) {
        toast(`Error`, {
          description: `The document is already in you Shared documents !`,
          duration: 5000,
          important: true,
        })
      } else {
        if (data?.private) {
          setShowPasswordField(true)
        }
        setEncryptedPassword(data?.password)
        setHoldersId(data?.holders_id)
      }
      // setDialogOpen(false)
    }
  }

  const onUnlockDocument = async () => {
    const bcryptjs = require("bcryptjs")
    const isPasswordCorrect = await bcryptjs.compare(docPassword, encrytedPassword)

    if (isPasswordCorrect) {
      let newHoldersId = [...holdersId, user?.id]
      const res = await fetch(`/api/document/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          holders_id: newHoldersId
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast(`Error`, {
          description: `The document is already in you Shared documents !`,
          duration: 5000,
          important: true,
        })
      } else {
        toast(`Info`, {
          description: `The document was successfully added to your Shared documents !`,
          duration: 5000,
          important: true,
        })
        onDocumentAdded(data)
        setDialogOpen(false)
      }
    } else {
      toast(`Error`, {
        description: `The password you entered is incorrect !`,
        duration: 5000,
        important: true,
      })
    }
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
