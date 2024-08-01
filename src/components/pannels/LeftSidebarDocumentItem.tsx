"use client"

import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Input, Switch } from "@nextui-org/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import Link from 'next/link';

export const LeftSidebarDocumentItem = ({ userId, document, onDocumentRemoved, onDocumentDeleted }: any) => {
  const router = useRouter()
  const [docName, setDocName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [docPassword, setDocPassword] = useState("")
  const [docPrivate, setDocPrivate] = useState(false)
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();

  useEffect(() => {
    const setDocument = () => {
      setDocName(document?.name)
      setDocPrivate(document?.private)
      setDocPassword(document?.password)
    }

    setDocument()
  }, [])

  const confirmAction = () => {
    if (document?.creator_id === userId) {
      onDocumentDeleted(document)
    } else {
      onDocumentRemoved(document)
    }
    onClose()
    router.push("/app")
  }

  return (
    <Button className="flex gap-1 justify-between" radius="sm" variant="light">
      <Link href={`/app/${document?._id}`} className="w-full flex items-start">
        <p className="line-clamp-1">
          {document.name}
        </p>
      </Link>

      <Dropdown>
        <DropdownTrigger>
          <EllipsisVerticalIcon />
        </DropdownTrigger>

        <DropdownMenu aria-label="Dropdown DocumentItem">
          <DropdownItem key="edit" onPress={onOpenEdit}>
            {'Edit document settings'}
          </DropdownItem>

          <DropdownItem key="delete" className="text-danger" color="danger" onPress={onOpen}>
            {'Delete document'}
          </DropdownItem>

        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpenEdit} onOpenChange={onOpenChangeEdit}>
        <ModalContent >
          <>
            <ModalHeader className="flex flex-col gap-1">Update document details</ModalHeader>

            <ModalBody>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-title" className="text-right">Title</Label>

                  <Input variant='bordered' id="doc-title" autoComplete="new-password" className="col-span-3" value={docName} onChange={(e) => setDocName(e?.target?.value)} />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-private" className="text-right">Private</Label>

                  <Switch id="doc-private" isSelected={docPrivate} onValueChange={() => setDocPrivate(!docPrivate)} className="col-span-3" />
                </div>
                { docPrivate ?
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="doc-password" className="text-right">Password</Label>
                    
                    <Input variant='bordered' id="doc-password" autoComplete="new-password" type="password" placeholder="Document password" className="col-span-3" value={docPassword} onChange={(e) => setDocPassword(e?.target?.value)} />
                  </div> : <></>
                }
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onOpenChangeEdit}>
                Cancel
              </Button>

              <Button isLoading={false} isDisabled={!docName} color="primary" onPress={() => null}>
                Update
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                { document?.creator_id === userId ? "Delete document" : "Remove Document" }
              </ModalHeader>

              <ModalBody>
                <p> 
                  { document?.creator_id === userId ?
                    "If you delete this document, other users who have added it will no longer be able to access it" :
                    "If you remove this document, you will need to import it again in the future."
                  }
                </p>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {'Cancel'}
                </Button>

                <Button color="primary" onPress={confirmAction}>
                  { document?.creator_id === userId ? "Delete" : "Remove" }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Button>
  )
}
