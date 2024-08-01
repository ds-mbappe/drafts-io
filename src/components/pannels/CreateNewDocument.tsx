"use client"

import React, { startTransition, useEffect, useState } from 'react'
import { Label } from "@/components/ui/label";
import { Button, Input, Switch } from '@nextui-org/react';
import { useRouter } from "next/navigation";
import { Modal,  ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";

export const CreateNewDocument = ({ userId, onDocumentSaved }: any) => {
  const router = useRouter();

  const [docName, setDocName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [docPassword, setDocPassword] = useState("")
  const [docPrivate, setDocPrivate] = useState(false)

  const handleSaveData = async () => {
    let formData = {
      name: docName,
      creator_id: userId,
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
    setIsLoading(false);
  };

  const submitAndCloseDialog = () => {
    setIsLoading(true);
    handleSaveData()
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
    <>
      <Button variant='shadow' className='w-full' onPress={changeDialogOpenState}>
        {'Create a new document'}
      </Button>

      <Modal isOpen={dialogOpen} onOpenChange={changeDialogOpenState}>
        <ModalContent >
          <>
            <ModalHeader className="flex flex-col gap-1">Create new document</ModalHeader>

            <ModalBody>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-title" className="text-right">Title</Label>

                  <Input variant='bordered' id="doc-title" autoComplete="new-password" placeholder="Document title" className="col-span-3" value={docName} onChange={(e) => setDocName(e.target.value)} />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-private" className="text-right">Private</Label>

                  <Switch id="doc-private" isSelected={docPrivate} onValueChange={() => setDocPrivate(!docPrivate)} className="col-span-3" />
                </div>
                { docPrivate ?
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="doc-password" className="text-right">Password</Label>
                    
                    <Input variant='bordered' id="doc-password" autoComplete="new-password" type="password" placeholder="Document password" className="col-span-3" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} />
                  </div> : <></>
                }
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={changeDialogOpenState}>
                Cancel
              </Button>

              <Button isLoading={isLoading} isDisabled={!docName} color="primary" onPress={submitAndCloseDialog}>
                Create
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  )
}
