"use client";

import { Editor, EditorContent, useEditor } from "@tiptap/react";
import React, { useState, useEffect, useTransition, useMemo, useRef, useCallback } from "react";
import { ExtensionKit } from './extensions/extension-kit';
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import CollaborationHistory, { CollabOnUpdateProps } from '@tiptap-pro/extension-collaboration-history';
import { useBlockEditor } from "./hooks/useBlockEditor";
import type { Doc as YDoc } from 'yjs'
import { TiptapCollabProvider } from "@hocuspocus/provider";
import { LinkMenu } from './menus/LinkMenu'
import { TextMenu } from './menus/TextMenu/TextMenu'
import { Image, Spinner, Button, Avatar, Tooltip, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import { useDropzone } from 'react-dropzone';
import TableRowMenu from "./extensions/Table/menus/TableRow/TableRow";
import TableColumnMenu from "./extensions/Table/menus/TableColumn/TableColumn";
import ImageBlockMenu from "./extensions/ImageBlock/components/ImageBlockMenu";
import { v2 as cloudinary } from "cloudinary";
import { BookPlusIcon, CheckIcon, CircleCheckIcon, CircleXIcon, EllipsisIcon, EyeIcon, HeartIcon, MessageCircleMoreIcon, PencilIcon, PlusIcon, Share2Icon, ShareIcon, Trash2Icon } from "lucide-react";
import moment from "moment";
import { followUser } from "@/actions/followUser";
import { checkFollowState } from "@/actions/checkFollowState";
import { unfollowUser } from "@/actions/unfollowUser";
import { deleteDocument, updateDocument } from "@/actions/document";
import { errorToast, successToast } from "@/actions/showToast";
import ModalPreviewDraft from "../pannels/ModalPreviewDraft";
import ModalValidation from "../pannels/ModalValidation";

export default function BlockEditor({ documentId, doc, setSaveStatus, onDocumentUpdated, currentUser }: {
  documentId: String,
  doc: any,
  setSaveStatus: Function,
  onDocumentUpdated: Function,
  // yDoc: YDoc | null,
  currentUser: any,
  // provider: TiptapCollabProvider | null,
  // updateHistoryData: Function | null,
}) {
  const router = useRouter();
  const menuContainerRef = useRef(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenPublish, onOpen: onOpenPublish, onOpenChange: onOpenChangePublish } = useDisclosure();
  const { isOpen: isOpenPreviewDoc, onOpen: onOpenPreviewDoc, onOpenChange: onOpenChangePreviewDoc } = useDisclosure();
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  // Update document, simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(async ({ editor }: { editor: Editor }) => {
    const editorData = editor?.getHTML();
    const formData = {
      content: editorData,
      word_count: editor?.storage.characterCount?.words(),
      character_count: editor?.storage.characterCount?.characters(),
    }
    const response = await updateDocument(documentId, formData);

    if (!response.ok) {
      // setSaveStatus("Waiting to Save.");
      errorToast(`Failed to update document, please try again !`)
    } else {
      // if (provider?.isAuthenticated) {
      //   setSaveStatus("Synced");
      // } else {
      //   setSaveStatus("Not Synced");
      // }
  
      // Force a cache invalidation.
      startTransition(() => {
        router.refresh();
      });
    }
  }, 1000);

  // const UpdateHistoryVersions = useDebouncedCallback(() => {
  //   if (editor?.can().saveVersion()) {
  //     // console.log("Can save new version")
  //   }
  // }, 30000)

  const { editor } = useBlockEditor({
    // yDoc,
    // provider,
    doc,
    currentUser,
    // updateHistoryData,
    setSaveStatus,
    debouncedUpdates,
    // UpdateHistoryVersions
  });

  // Preview editor
  const previewEditor = useEditor({
    editable: false,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: doc?.content,
    extensions: [
      ...ExtensionKit(),
    ],
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full !pt-0 !pr-0 !pb-0 !pl-0 overflow-y-auto select-all',
      },
    },
  }, [doc]);

  // Update document cover
  const onDrop = useCallback(async(acceptedFiles: any) => {
    setUploadLoading(true)
    const file = acceptedFiles?.[0]
    if (file) {
			const timestamp = Math.round((new Date).getTime()/1000)
      const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: "cover_urls",
      }, process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET as string )

      const formData = new FormData()
			formData.append('file', file)
			formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string)
			formData.append('signature', signature)
			formData.append('timestamp', JSON.stringify(timestamp))
			formData.append('folder', 'cover_urls')

			const result = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string}/auto/upload`, {
				method: 'POST',
				body: formData,
			})
      if (result?.ok) {
        const data = await result.json()
        const formData = {
          cover: data?.url,
          word_count: editor?.storage.characterCount?.words(),
          character_count: editor?.storage.characterCount?.characters(),
        }
        const response = await updateDocument(documentId, formData);

        if (response?.ok) {
          successToast(`Document cover updated!`)
          onDocumentUpdated();
        } else {
          errorToast(`Error updating document cover, please try again!`)
        }
      } else {
        errorToast(`Error uploading image, please try again!`)
      }
    }
    setUploadLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, open } = useDropzone({
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop,
    onDropRejected(fileRejections, event) {
      errorToast(`File format not supported, accepted formats are ".png, .jpg, .jpeg, .gif, .avif, .webp"`)
    },
    accept: {
      'image/png': ['.png', '.jpg', '.jpeg', '.gif', '.avif', '.webp']
    }
  })

  // Follow/unfollow toggle
  const onToggleFollowUser = useDebouncedCallback(async () => {
    setIsFollowLoading(true)
    if (isFollowingAuthor) {
      await unfollowUser(currentUser?.id, doc?.authorId)
    } else {
      await followUser(currentUser?.id, doc?.authorId)
    }
    getFollowSate()
    setIsFollowLoading(false)
  }, 300)

  const getFollowSate = async () => {
    const res = await checkFollowState(currentUser?.id, doc?.authorId)
    setIsFollowingAuthor(res)
  }

  // Update title
  const updateTitleWithTitleValue = useDebouncedCallback(async () => {
    const formData = { title: titleValue }
    const response = await updateDocument(documentId, formData);
  
    if (!response.ok) {
      errorToast(`An error occurred, please try again.`);
    } else {
      successToast("Title updated successfully.");
      onDocumentUpdated(documentId);
    }
    onDocumentUpdated(documentId);
    setIsUpdatingTitle(false);
  }, 300);

  // Reset title field
  const resetTitleInput = () => {
    setTitleValue(doc?.title);
    setIsUpdatingTitle(false);
  }

  // Checks if the title is valid
  const isTitleInvalid = () => {
    return (titleValue === doc?.title || titleValue?.length < 1)
  }

  // Publish/Unpublish document
  const onPublishDocument = useDebouncedCallback(async () => {
    setActionLoading(true);
    const formData = { private: !doc?.private }
    const response = await updateDocument(documentId, formData);
  
    if (!response.ok) {
      errorToast(`An error occurred, please try again.`);
    } else {
      successToast(doc?.private ? `Your document is now available for everyone.` : `Your document has been removed from the public space.`);
      onOpenChangePublish();
      onDocumentUpdated(documentId);
    }
    setActionLoading(false);
  }, 300);

  // Delete document
  const onDelete = useDebouncedCallback( async() => {
    const response = await deleteDocument(documentId);
  
    if (!response.ok) {
      errorToast(`An error occurred, please try again.`);
    } else {
      successToast("Document deleted successfully.");
      router.back();
    }
  }, 300)

  useEffect(() => {
    setTitleValue(doc?.title);
  }, [doc?.title])

  useEffect(() => {
    if (doc?.authorId !== currentUser?.id) {
      getFollowSate();
    }
  }, [currentUser?.id])

  if (!editor || !doc || !currentUser) {
    return (
      <div className="relative w-full flex min-h-screen flex-1 cursor-text flex-col items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="relative w-full flex cursor-text flex-col items-start">
      <div className="w-full cursor-text flex flex-col gap-10 relative mx-auto py-12" ref={menuContainerRef}>
        <div className="w-full flex flex-col gap-5 mx-auto px-5 md:!px-20 xl:!px-0">
          <div className="flex gap-1 justify-between items-start">
            { isUpdatingTitle ?
                <Input
                  isClearable
                  errorMessage={"Enter at lest one character !"}
                  isInvalid={titleValue?.length < 1}
                  value={titleValue}
                  variant="bordered"
                  label="Document title"
                  onValueChange={setTitleValue}
                />
                :
                <p className="font-medium text-xl">
                  {doc?.title}
                </p>
            }

            <div className="flex flex-col items-center justify-center">
              { isUpdatingTitle ?
                <>
                  <Button
                    variant="light"
                    radius="full"
                    size="sm"
                    isIconOnly
                    isDisabled={isTitleInvalid()}
                    color={isTitleInvalid() ? 'default' : 'success'}
                    className={isTitleInvalid() ? '!cursor-not-allowed' : '!cursor-pointer'}
                    onPress={updateTitleWithTitleValue}
                  >
                    <CircleCheckIcon />
                  </Button>

                  <Button
                    variant="light"
                    radius="full"
                    color="danger"
                    size="sm"
                    isIconOnly
                    onPress={resetTitleInput}
                  >
                    <CircleXIcon />
                  </Button>
                </>
                :
                <Button
                  variant="light"
                  radius="full"
                  color="default"
                  size="sm"
                  isIconOnly
                  onPress={() => setIsUpdatingTitle(!isUpdatingTitle)}
                >
                  <PencilIcon size={16} className="text-foreground-500" />
                </Button>
              }
            </div>

          </div>

          <div className="w-full flex flex-col md:!flex-row items-start md:!items-center gap-5 md:!gap-0 justify-start md:!justify-between">
            {/* Author details */}
            <div className="w-full flex gap-3 items-center">
              <Avatar
                isBordered
                color="default"
                showFallback
                name={doc?.authorFirstname?.split("")?.[0]?.toUpperCase()}
                size="md"
                className="cursor-default"
                src={doc?.authorAvatar}
              />

              <div className="flex flex-col">
                <p className="w-fit font-medium cursor-default hover:underline transition-all">
                  Written by {doc?.authorId === currentUser?.id ? `You` : `${doc?.authorFirstname} ${doc?.authorLastname}`}
                </p>

                <div className="flex items-center gap-1">
                  <p className="text-foreground-500 text-sm">
                    {`Published`}
                  </p>

                  <p className="text-foreground-500 text-sm">
                    {moment(doc?.createdAt).format('MMM DD, YYYY')}
                  </p>
                </div>
              </div>
            </div>

            {/* Follow/Unfollow button */}
            {doc?.authorId !== currentUser?.id &&
              <Button
                color="primary"
                variant={isFollowingAuthor ? 'solid' : 'flat'}
                radius="full"
                className="px-6"
                isLoading={isFollowLoading}
                startContent={
                  <div>
                    {isFollowingAuthor ? <CheckIcon size={20} /> : <PlusIcon size={20} /> }
                  </div>
                }
                onPress={onToggleFollowUser}
              >
                {isFollowingAuthor ? `Following` : `Follow`}
              </Button>
            }
          </div>

          <div className="w-full flex items-center justify-between py-2 border-y border-divider">
            <div className="w-full flex items-center gap-3 flex-1">
              <Button isIconOnly size={"sm"} variant={"light"} radius="full">
                <HeartIcon className="text-foreground-500" />
              </Button>

              <Button isIconOnly size={"sm"} variant={"light"} radius="full">
                <MessageCircleMoreIcon className="text-foreground-500" />
              </Button>
            </div>

            {doc?.authorId === currentUser?.id &&
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                    <Button isIconOnly size={"sm"} variant={"light"}>
                      <EllipsisIcon className="rotate-90 text-foreground-500" />
                    </Button>
                </DropdownTrigger>

                <DropdownMenu aria-label="Document Actions" variant="flat">
                  {/* Preview */}
                  <DropdownItem
                    key="preview"
                    startContent={<EyeIcon />}
                    onClick={onOpenPreviewDoc}
                  >
                    {'Preview draft'}
                  </DropdownItem>

                  {/* Publish */}
                  <DropdownItem
                    key="publish"
                    startContent={<BookPlusIcon />}
                    onClick={onOpenPublish}
                  >
                    {doc?.private ? 'Publish draft' : 'Unpublish draft'}
                  </DropdownItem>

                  {/* Export */}
                  <DropdownItem
                    key="export_document"
                    startContent={<ShareIcon />}
                  >
                    {'Export draft'}
                  </DropdownItem>

                  {/* Delete */}
                  <DropdownItem
                    key="delete_document"
                    color="danger"
                    onPress={onOpen}
                    startContent={<Trash2Icon className="text-danger" />}
                  >
                    {'Delete draft'}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            }
          </div>
        </div>

        {doc?.cover ?
          // Show cover if it's present
          <div className="w-full flex justify-center items-center max-w-3xl mx-auto cursor-default relative px-5 md:!px-0">
            <div
              className="w-full h-[350px] rounded-[12px] max-w-3xl flex justify-center items-center bg-cover bg-center overflow-hidden border border-divider"
              style={{backgroundImage: `url(${doc?.cover})`}}
            />

            {doc?.authorId === currentUser?.id &&
              <Button
                variant="light"
                radius="full"
                color="default"
                size="sm"
                isIconOnly
                className="absolute -top-4 right-1/2 translate-x-1/2 !z-[10]"
                onPress={open}
              >
                <PencilIcon size={16} className="text-foreground-500" />
              </Button>
            }
          </div> :
          // Upload a cover photo if no cover
          <div
            className={isDragActive ?
              "w-full h-[350px] rounded-[12px] mx-auto max-w-3xl border border-dashed border-primary cursor-default flex items-center justify-center" :
              "w-full h-[350px] rounded-[12px] mx-auto max-w-3xl border border-divider cursor-default flex items-center justify-center"
            }
          >
            {uploadLoading ?
              <Spinner size="lg" /> :
              <div
                {...getRootProps()}
                className="w-full h-full flex flex-col"
              >
                <input {...getInputProps()} />

                <div className="w-full h-full flex flex-col gap-8 items-center justify-center">
                  <p className={isDragActive ? "text-primary font-medium text-xl" : "font-medium text-xl"}>
                    {isDragActive ? "Release to drop file" : "Drag and drop an image to upload"}
                  </p>

                  {!isDragActive &&
                    <Button
                      color="default"
                      variant={"bordered"}
                      className="w-fit font-medium"
                      onClick={open}
                    >
                      {'Select image'}
                    </Button>
                  }
                </div>
              </div>
            }
          </div>
        }

        {doc?.authorId === currentUser?.id ?
          <>
            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} />
            <TableRowMenu editor={editor} appendTo={menuContainerRef} />
            <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
            <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
          </>
          :
          <></>
        }
        <EditorContent
          editor={editor}
          className={doc?.authorId === currentUser?.id ? 'tiptap editableClass' : 'tiptap readOnlyClass select-text'}
          spellCheck={"false"}
        />
      </div>

      <ModalPreviewDraft doc={doc} isOpen={isOpenPreviewDoc} previewEditor={previewEditor} onOpenChange={onOpenChangePreviewDoc} />

      <ModalValidation
        title={doc?.private ? "Publish draft" : "Unpublish draft"}
        body={doc?.private ?
          "By default, all your drafts are private, that means they are only visible to you and you only. If you choose to publish your draft, users from around the world will be able to see it." :
          "If you choose to unpublish your draft, it will be unavailable to the public."
        }
        cancelText={"Cancel"}
        validateText={doc?.private ? "Publish" : "Unpublish"}
        isOpen={isOpenPublish}
        validateLoading={actionLoading}
        onOpenChange={onOpenChangePublish}
        onCancel={onOpenChangePublish}
        onValidate={onPublishDocument}
      />

      <ModalValidation
        title={doc?.authorId === currentUser?.id ? "Delete draft" : "Remove Document"}
        body={"Are you sure you want to delete this draft ? If you choose to proceed, other users will no longer be able to access it"}
        cancelText={"Cancel"}
        validateText={"Delete"}
        isOpen={isOpen}
        validateLoading={false}
        onOpenChange={onOpenChange}
        onCancel={onOpenChange}
        onValidate={onDelete}
      />
    </div>
  )
}