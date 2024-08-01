"use client"

// import bcrypt from 'bcrypt';
import React, { startTransition, useState } from 'react'
import { Label } from "@/components/ui/label";
import { Button, Input, Switch } from '@nextui-org/react';
import { useRouter } from "next/navigation";
import { Modal,  ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";

export const AddExistingDocument = ({ userId, onDocumentAdded }: any) => {
  const router = useRouter();
  const [docId, setDocId] = useState("")
  const [holdersId, setHoldersId] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [docPassword, setDocPassword] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [encrytedPassword, setEncryptedPassword] = useState("")
  const [showPasswordField, setShowPasswordField] = useState(false)

  const onAddDocument = async () => {
    const res = await fetch(`/api/document/${docId}/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()

    if (!res.ok) {
      toast(`Error`, {
        description: `Failed to get document status.`,
        duration: 5000,
        important: true,
      })
    } else {
      if (data?.holders_id?.includes(userId)) {
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
      let newHoldersId = [...holdersId, userId]
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
    <>
      <Button variant='shadow' className='w-full' onPress={changeDialogOpenState}>
        {'Add existing document'}
      </Button>

      <Modal isOpen={dialogOpen} onOpenChange={changeDialogOpenState}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">Import existing document</ModalHeader>

            <ModalBody>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="doc-id" className="text-right">DocumentID</Label>

                  <Input variant='bordered' id="doc-id" autoComplete="new-password" placeholder="The id of the document you want to import" value={docId} onChange={(e) => setDocId(e.target.value)} />
                </div>

                {showPasswordField ?
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground font-normal">
                      The document you are trying to access is private, please enter it&apos;s password to unlock and import it.
                    </p>

                    <div className="flex items-center gap-4">
                      <Label htmlFor="doc-password" className="text-left">Password</Label>

                      <Input id="doc-password" type="password" autoComplete="new-password" placeholder="Document password" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} />
                    </div>
                  </div> : <></>
                }
              </div>
            </ModalBody>

            <ModalFooter>
              {showPasswordField ?
                <Button color='primary' className='cursor-pointer' onClick={onUnlockDocument}>
                  Unlock document
                </Button> :

                <Button color='primary' isDisabled={!docId} className='cursor-pointer' onClick={onAddDocument}>
                  Add document
                </Button>
              }
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  )
}
