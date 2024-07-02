"use client"

import React from 'react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import Link from 'next/link';

export const LeftSidebarDocumentItem = ({ userId, document, onDocumentRemoved, onDocumentDeleted }: any) => {
  const router = useRouter()
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

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
          <DropdownItem key="edit">
            {'Edit document settings'}
          </DropdownItem>

          <DropdownItem key="delete" className="text-danger" color="danger" onPress={onOpen}>
            {'Delete document'}
          </DropdownItem>

        </DropdownMenu>
      </Dropdown>

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
    // <Button asChild variant={"ghost"}>
    //   <HoverCard openDelay={100} closeDelay={100}>

    //     <HoverCardContent asChild side="bottom" className="w-fit p-1" align="end">
    //       <div className="flex">
    //         <div className="p-1.5 hover:bg-muted-foreground/10 rounded cursor-pointer">
    //           <SquarePen />
    //         </div>

    //         <DialogValidation
    //           trigger={
    //             <div className="p-1.5 hover:bg-destructive/10 text-destructive rounded cursor-pointer">
    //               <Trash2 />
    //             </div>
    //           }
    //           title={document?.creator_id === userId ? "Delete document" : "Remove Document"}
    //           description={
    //             document?.creator_id === userId ?
    //               "If you delete this document, other users who have added it will no longer be able to access it" :
    //               "If you remove this document, you will need to import it again in the future."
    //           }
    //           secondaryText="Cancel"
    //           primaryText={document?.creator_id === userId ? "Delete" : "Remove"}
    //           onPrimaryClick={onTrashClicked}
    //         />
    //       </div>
    //     </HoverCardContent>
    //   </HoverCard>
    // </Button>
  )
}
