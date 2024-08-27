"use client"

import React, { startTransition, useEffect, useState } from 'react'
import { Label } from "@/components/ui/label";
import { Button, Input, Switch, Textarea, Tooltip } from '@nextui-org/react';
import { useRouter } from "next/navigation";
import { Modal,  ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";
import { CirclePlusIcon } from 'lucide-react';

export const CreateNewDocument = ({ user, onDocumentSaved }: any) => {
  const router = useRouter();
  const motionProps = {
    variants: {
      exit: {
        opacity: 0,
        transition: {
          duration: 0.15,
          ease: "easeIn",
        }
      },
      enter: {
        opacity: 1,
        transition: {
          duration: 0.15,
          ease: "easeOut",
        }
      },
    },
  }
  const [docTitle, setDocTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [docPrivate, setDocPrivate] = useState(true)
  const [docLocked, setDocLocked] = useState(false)
  const [docCaption, setDocCaption] = useState("")

  const handleSaveData = async () => {
    let formData = {
      title: docTitle,
      caption: docCaption,
      creator: {
        email: user?.email,
        avatar: null,
        fullname: `Daniel Stéphane`,
      },
      private: docPrivate,
      locked: docLocked,
      content: "",
    }

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
    const data = await res.json()

    if (!res.ok) {
      toast.error(`Error`, {
        description: `An error occurred, please try again.`,
        duration: 5000,
        important: true,
      })
    }

    // Force a cache invalidation and redirect to the new document.
    startTransition(() => {
      // router.refresh();
      router.push(`/app/${data?.document?._id}`)
    });

    toast.success(`Document created`, {
      description: `Successfully created document ${docTitle}.`,
      duration: 5000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
    onDocumentSaved();
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
    setDocTitle("")
    setDocCaption("")
    setDocPrivate(true)
    setDocLocked(false)
  }

  return (
    <>
      <Tooltip
        content={"Create new document"}
        delay={0}
        closeDelay={0}
        motionProps={motionProps}
      >
        <Button isIconOnly size={"sm"} variant={"light"} onPress={changeDialogOpenState}>
          <CirclePlusIcon />
        </Button>
      </Tooltip>

      <Modal placement="center" isOpen={dialogOpen} onOpenChange={changeDialogOpenState}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">{'Create new document'}</ModalHeader>

          <ModalBody>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-title" className="text-right">{'Title'}</Label>

                <Input variant='bordered' id="doc-title" autoComplete="new-password" placeholder="Document title" className="col-span-3" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-caption" className="text-right">{'Caption'}</Label>

                <Textarea
                  id="doc-caption"
                  minRows={1}
                  maxRows={10}
                  value={docCaption}
                  variant="bordered"
                  className="col-span-3"
                  placeholder="Document caption"
                  onChange={(e) => setDocCaption(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-private" className="text-right">{'Private'}</Label>

                <Switch id="doc-private" isSelected={docPrivate} onValueChange={() => setDocPrivate(!docPrivate)} className="col-span-3" />
              </div>
              
              { !docPrivate ?
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-locked" className="text-right">{'Locked'}</Label>
                  
                  <Switch id="doc-locked" isSelected={docLocked} onValueChange={() => setDocLocked(!docLocked)} className="col-span-3" />
                </div> : <></>
              }
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={changeDialogOpenState}>
              {'Cancel'}
            </Button>

            <Button
              isLoading={isLoading}
              isDisabled={!(docTitle && docCaption)}
              color="primary"
              onPress={submitAndCloseDialog}
            >
              {'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
