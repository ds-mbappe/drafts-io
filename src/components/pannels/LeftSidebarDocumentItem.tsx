"use client"

import React, { useEffect, useState, startTransition } from 'react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Input, Switch } from "@nextui-org/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import Link from 'next/link';
import { toast } from "sonner";
import moment from "moment";

export const LeftSidebarDocumentItem = ({ email, document, onDocumentRemoved, onDocumentDeleted, onDocumentEdited }: any) => {
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
    if (document?.creator_email === email) {
      onDocumentDeleted(document)
    } else {
      onDocumentRemoved(document)
    }
    onClose()
    router.push("/app")
  }

  const handleSaveData = async () => {
    setIsLoading(true);

    let formData = {
      id: document?._id,
      name: docName,
      private: docPrivate,
      encrypted_password: docPassword,
    }

    const res = await fetch("/api/documents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error("Failed to update document.")
    }

    toast(`Document updated`, {
      description: `Successfully updated document ${docName}.`,
      duration: 5000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
    onOpenChangeEdit();
    onDocumentEdited(data?.document);
    setDocPassword("");
    setIsLoading(false);
  };

  return (
    <>
      <Link href={`/app/${document?._id}`}>
        <div className='w-full px-4 py-2 rounded-md flex flex-col hover:bg-foreground-100'>
          <p className="line-clamp-1 text-start font-semibold break-all">
            {document?.name}
          </p>
          <p className="line-clamp-1 text-foreground-500 text-sm">
          {'Updated '} {moment(document?.updatedAt).calendar()}
          </p>
        </div>
      </Link>
    </>
  )
}
