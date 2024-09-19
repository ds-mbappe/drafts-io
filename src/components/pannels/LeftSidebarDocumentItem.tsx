"use client"

import moment from "moment";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Image, Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, Tooltip, useDisclosure } from "@nextui-org/react";
import { BookPlusIcon, EllipsisIcon, EyeIcon, PencilIcon, Share2Icon, ShareIcon, Trash2Icon } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { EditorContent, useEditor } from "@tiptap/react";
import ExtensionKit from "../editor/extensions/extension-kit";

export const LeftSidebarDocumentItem = ({ document, user }: any) => {
  const router = useRouter();
  const [docTitle, setDocTitle] = useState("");
  const [docCaption, setDocCaption] = useState("")
  const [docTopic, setDocTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenPublish, onOpen: onOpenPublish, onOpenChange: onOpenChangePublish } = useDisclosure();
  const { isOpen: isOpenPreviewDoc, onOpen: onOpenPreviewDoc, onOpenChange: onOpenChangePreviewDoc } = useDisclosure();

  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: document?.content,
    extensions: [
      ...ExtensionKit(),
    ],
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full !pt-0 !pr-0 !pb-0 !pl-0 overflow-y-auto',
      },
    },
  });

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

  const showToastSuccess = (deleted: Boolean) => {
    toast.success(`Info`, {
      description: `The document has been successfully ${deleted ? 'deleted' : 'removed from your documents'} !`,
      duration: 5000,
      important: true,
    })
  }

  const showToastError = (deleted: Boolean) => {
    toast.error(`Error`, {
      description: `There was an error ${deleted ? 'deleting' : 'removing'} the document !`,
      duration: 5000,
      important: true,
    })
  }

  const handleSaveData = async () => {
    setIsLoading(true);

    let formData = {
      id: document?.id,
      title: docTitle,
      topic: docTopic,
      caption: docCaption,
    }

    const response = await fetch("/api/documents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
    const data = await response.json()

    if (!response.ok) {
      toast.error(`Error`, {
        description: `An error occured, please try again !`,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
    } else {
      toast.success(`Document updated`, {
        description: `Successfully updated document ${docTitle}.`,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
      onOpenChangeEdit();
      setIsLoading(false);
    }
  };

  const onPublishDocument = async() => {
    setIsLoading(true);

    let formData = {
      id: document?.id,
      private: !document?.private,
    }

    const res = await fetch(`/api/documents/${user?.email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    });

    if (!res.ok) {
      toast.error(`Error`, {
        description: `An error occurred, please try again.`,
        duration: 5000,
        important: true,
      })
    } else {
      toast.success(`Sucess`, {
        description: document?.private ? `Your document is now available for everyone.` : `Your document has been removed from the public space.`,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
    }
    setIsLoading(false);
    onOpenChangePublish()
  }

  const onDocumentDeleted = async() => {
    const res = await fetch(`/api/document/${document?.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      showToastError(true)
    } else {
      showToastSuccess(true)

      // const newDocs = documents?.filter((doc: any) => doc?._id !== document?.id)
      // setDocuments(newDocs)
      router.push('/app')
    }
  }

  useEffect(() => {
    const setDocument = () => {
      setDocTitle(document?.title);
      setDocCaption(document?.caption);
      setDocTopic(document?.topic);
    }

    setDocument();
  }, [])

  return (
    <>
      <Link href={`/app/${document?.id}`}>
        <div className='w-full px-4 py-2 rounded-md flex items-center gap-1 hover:bg-foreground-100'>
          <div className='w-full flex flex-col gap-1'>
            <div className="flex flex-col">
              <p className="line-clamp-1 text-start font-semibold break-all">
                {document?.title}
              </p>
              
              <p className="line-clamp-1 text-foreground-500 text-sm">
                {'Updated '} {moment(document?.updatedAt).fromNow()}
              </p>
            </div>

            {document?.topic ?
              <Chip variant="bordered" size="sm">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">#</span>

                  <p>{document?.topic}</p>
                </div>
              </Chip> :
              <Chip variant="bordered" size="sm">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {'No topic'}
                  </span>
                </div>
              </Chip>
            }
          </div>

          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button isIconOnly size={"sm"} variant={"light"} onClick={(e) => e.preventDefault()}>
                <Tooltip
                  content={"Options"}
                  delay={0}
                  closeDelay={0}
                  motionProps={motionProps}
                >
                  <EllipsisIcon className="rotate-90" />
                </Tooltip>
              </Button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Document Actions" variant="flat">
              {/* Preview */}
              <DropdownItem
                key="preview"
                startContent={<EyeIcon />}
                onClick={onOpenPreviewDoc}
              >
                {'Preview document'}
              </DropdownItem>

              {/* Publish */}
              <DropdownItem
                key="publish"
                startContent={<BookPlusIcon />}
                onClick={onOpenPublish}
              >
                {document?.private ? 'Publish document' : 'Unpublish document'}
              </DropdownItem>

              {/* Share */}
              <DropdownItem
                key="share"
                startContent={<Share2Icon />}
              >
                {'Share document'}
              </DropdownItem>

              {/* Export */}
              <DropdownItem
                key="export_document"
                startContent={<ShareIcon />}
              >
                {'Export document'}
              </DropdownItem>

              {/* Edit */}
              <DropdownItem
                key="edit_document"
                showDivider
                onPress={onOpenEdit}
                startContent={<PencilIcon />}
              >
                {'Edit document settings'}
              </DropdownItem>

              {/* Delete */}
              <DropdownItem
                key="delete_document"
                color="danger"
                onPress={onOpen}
                startContent={<Trash2Icon className="text-danger" />}
              >
                {'Delete document'}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </Link>

      {/* Modal Preview Document */}
      <Modal hideCloseButton scrollBehavior="inside" isOpen={isOpenPreviewDoc} placement="center" size="3xl" onOpenChange={onOpenChangePreviewDoc}>
        <ModalContent>
          {(onClosePreviewDoc) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {"Preview of "} {document?.title}
              </ModalHeader>

              <ModalBody className="w-full flex flex-col gap-8 !px-4 !py-0 overflow-y-auto">
                {document?.cover &&
                  <div className="w-full mx-auto flex justify-center pt-8">                    
                    <Image
                      isBlurred
                      height={350}
                      src={document?.cover}
                      alt="Document Cover Image"
                    />
                  </div>
                }

                <EditorContent editor={editor} />
              </ModalBody>

              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClosePreviewDoc}>
                  {'Close'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Publish document */}
      <Modal isOpen={isOpenPublish} placement="center" onOpenChange={onOpenChangePublish}>
        <ModalContent>
          {(onClosePublish) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                { document?.private ? "Publish document" : "Unpublish document" }
              </ModalHeader>

              <ModalBody className="flex flex-col gap-4">
                {document?.private ?
                  <p className="text-foreground-500">
                    {"By default, all your documents are private, that means they are only visible to you and you only. If you choose to publish your document, users from around the world will be able to see it."}
                  </p> :
                  <p className="text-foreground-500">
                    {"If you choose to unpublish your document, it will be unavailable to the public."}
                  </p>
                }

                {/* <div className="flex items-center gap-4">
                  <Label htmlFor="doc-locked" className="text-right">{'Locked'}</Label>

                  <Switch id="doc-private" isSelected={docLocked} onValueChange={() => setDocLocked(!docLocked)} />
                </div> */}
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClosePublish}>
                  {'Cancel'}
                </Button>

                <Button isLoading={isLoading} color="primary" onPress={onPublishDocument}>
                  { document?.private ? "Publish" : "Unpublish" }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit document settings */}
      <Modal isOpen={isOpenEdit} placement="center" onOpenChange={onOpenChangeEdit}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">{'Update document details'}</ModalHeader>

          <ModalBody>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-title" className="text-right">{'Title'}</Label>

                <Input variant='bordered' id="doc-title" autoComplete="new-password" className="col-span-3" value={docTitle} onChange={(e) => setDocTitle(e?.target?.value)} />
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
                  variant="bordered"
                  aria-label="doc-topic"
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
            <Button color="danger" variant="light" onPress={onOpenChangeEdit}>
              {'Cancel'}
            </Button>

            <Button isLoading={isLoading} isDisabled={!(docTitle)} color="primary" onPress={handleSaveData}>
              {'Update'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete document */}
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                { document?.creator_email === user?.email ? "Delete document" : "Remove Document" }
              </ModalHeader>

              <ModalBody>
                <p> 
                  { document?.creator_email === user?.email ?
                    "If you delete this document, other users who have added it will no longer be able to access it" :
                    "If you remove this document, you will need to import it again in the future."
                  }
                </p>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {'Cancel'}
                </Button>

                <Button color="primary" onPress={onDocumentDeleted}>
                  { document?.creator_email === user?.email ? "Delete" : "Remove" }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}