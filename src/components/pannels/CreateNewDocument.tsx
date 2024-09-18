"use client"

import React, { startTransition, useEffect, useState } from 'react'
import { Label } from "@/components/ui/label";
import { Button, Input, Select, SelectItem, Switch, Textarea, Tooltip } from '@nextui-org/react';
import { useRouter } from "next/navigation";
import { Modal,  ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";
import { SquarePenIcon } from 'lucide-react';

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
  const [docCaption, setDocCaption] = useState("")
  const [docTopic, setDocTopic] = useState("")
  const topics = [
    "World News",
    "Politics",
    "Business",
    "Technology",
    "Science",
    "Health",
    "Entertainment",
    "Sports",
    "Travel",
    "Lifestyle",
    "Environment",
    "Education",
    "Food & Drink",
    "Culture",
    "Fashion",
    "Finance",
    "Real Estate",
    "Automotive",
    "Gaming",
    "Opinion"
  ]

  const handleSaveData = async () => {
    // const response = await getSession()

    let formData = {
      title: docTitle,
      caption: docCaption,
      creator_email: user?.email,
      creator: {
        avatar: user?.avatar,
        fullname: `${user?.firstname} ${user?.lastname}`,
      },
      cover: "https://pyxis.nymag.com/v1/imgs/51b/28a/622789406b8850203e2637d657d5a0e0c3-avatar-rerelease.1x.rsquare.w1400.jpg",
      topic: docTopic,
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
    } else {
      // Force a cache invalidation and redirect to the new document.
      startTransition(() => {
        router.refresh();
        router.push(`/app/${data?.document?.id}`);
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
    }
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
          <SquarePenIcon />
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
                <Label htmlFor="doc-topic" className="text-right">{'Topic'}</Label>

                <Select 
                  id="doc-topic"
                  aria-label="toc-topic"
                  variant="bordered"
                  className="col-span-3"
                  value={docTopic}
                  placeholder="Select a topic"
                  onChange={(e) => setDocTopic(e.target.value)}
                >
                  {topics.map((topic) => (
                    <SelectItem key={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={changeDialogOpenState}>
              {'Cancel'}
            </Button>

            <Button
              isLoading={isLoading}
              isDisabled={!(docTitle && docCaption && docTopic)}
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
