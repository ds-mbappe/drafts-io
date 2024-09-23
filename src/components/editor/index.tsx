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
import { toast } from "sonner";
import { Image, Spinner, Button, Avatar } from "@nextui-org/react";
import { useDropzone } from 'react-dropzone';
import TableRowMenu from "./extensions/Table/menus/TableRow/TableRow";
import TableColumnMenu from "./extensions/Table/menus/TableColumn/TableColumn";
import ImageBlockMenu from "./extensions/ImageBlock/components/ImageBlockMenu";
import { v2 as cloudinary } from "cloudinary";
import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react";
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import moment from "moment";
import { followUser } from "@/actions/followUser";
import { checkFollowState } from "@/actions/checkFollowState";
import { unfollowUser } from "@/actions/unfollowUser";

export default function BlockEditor({ documentId, doc, setSaveStatus, currentUser }: {
  documentId: String,
  doc: any,
  setSaveStatus: Function,
  // yDoc: YDoc | null,
  currentUser: any,
  // provider: TiptapCollabProvider | null,
  // updateHistoryData: Function | null,
}) {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const menuContainerRef = useRef(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadLoading, setUploadLoading] = useState(false);
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(async ({ editor }: { editor: Editor }) => {
    const editorData = editor?.getHTML();
    await patchRequest(documentId, editorData);
    setSaveStatus("Synced");
    // setTimeout(() => {
    //   if (provider?.isAuthenticated) {
    //     setSaveStatus("Synced");
    //   } else {
    //     setSaveStatus("Not Synced");
    //   }
    // }, 500);
  }, 1000);

  // const UpdateHistoryVersions = useDebouncedCallback(() => {
  //   if (editor?.can().saveVersion()) {
  //     // console.log("Can save new version")
  //   }
  // }, 30000)

  const ErrorToast = (text: string) => {
    toast.error(`Error`, {
      description: text,
      duration: 3000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
  }

  const SuccessToast = (text: string) => {
    toast.success(``, {
      description: text,
      duration: 3000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
  }

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
  
  const patchRequest = async (documentId: String, document: any) => {
    const response = await fetch(`/api/document/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: document,
        word_count: editor?.storage.characterCount?.words(),
        character_count: editor?.storage.characterCount?.characters(),
      }),
    });

    if (!response.ok) {
      setSaveStatus("Waiting to Save.");
      ErrorToast(`Failed to update document, please try again !`)
    }

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
        const response = await fetch(`/api/document/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cover: data?.url,
            word_count: editor?.storage.characterCount?.words(),
            character_count: editor?.storage.characterCount?.characters(),
          }),
        });

        if (response?.ok) {
          SuccessToast(`Document cover updated!`)
        } else {
          ErrorToast(`Error updating document cover, please try again!`)
        }
      } else {
        ErrorToast(`Error uploading image, please try again!`)
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
      ErrorToast(`File format not supported, accepted formats are ".png, .jpg, .jpeg, .gif, .avif, .webp"`)
    },
    accept: {
      'image/png': ['.png', '.jpg', '.jpeg', '.gif', '.avif', '.webp']
    }
  })

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

  useEffect(() => {
    if (doc?.authorId !== currentUser?.id) {
      getFollowSate();
    }
  }, [currentUser?.id])

  if (!editor || !doc || !currentUser) return

  return (
    <div className="relative w-full flex min-h-screen cursor-text flex-col items-start">
      <div className="flex flex-col gap-10 relative w-full mx-auto py-12" ref={menuContainerRef}>
        <motion.div
          className="z-[50] fixed top-[64px] left-0 right-0 h-1.5 bg-primary origin-[0%]"
          style={{ scaleX }}
        />

        <div className="w-full flex flex-col gap-5 max-w-7xl mx-auto px-5 md:!px-20 xl:!px-0">
          <p className="font-medium text-xl">
            {doc?.title}
          </p>

          <div className="w-full flex flex-col md:!flex-row items-start md:!items-center gap-5 md:!gap-0 justify-start md:!justify-between">
            {/* Author details */}
            <div className="w-full flex gap-3 items-center">
              <Avatar
                isBordered
                color="primary"
                showFallback
                name={doc?.authorFirstname?.split("")?.[0]?.toUpperCase()}
                size="md"
                className="cursor-default"
                src={doc?.authorAvatar}
              />

              <div className="flex flex-col">
                <p className="font-medium cursor-default">
                  {`${doc?.authorFirstname} ${doc?.authorLastname}`}
                </p>

                <div className="flex items-center gap-1">
                  <p className="text-foreground-500">
                    {`Published`}
                  </p>

                  <p className="text-foreground-500">
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
                onClick={onToggleFollowUser}
              >
                {isFollowingAuthor ? `Following` : `Follow`}
              </Button>
            }
          </div>
        </div>

        {doc?.cover ?
          // Show cover if it's present
          <div className="w-full flex justify-center items-center max-w-3xl mx-auto cursor-default relative px-5 md:!px-0">
            {/* <Image
              isBlurred
              height={350}
              src={doc?.cover}
              alt="Document Cover Image"
            /> */}
            <div
              className="w-full h-[350px] rounded-[12px] mx-auto max-w-3xl flex justify-center items-center bg-cover bg-center overflow-hidden border border-divider"
              style={{backgroundImage: `url(${doc?.cover})`}}
            />

            {doc?.authorId === currentUser?.id &&
              <Button
                variant="solid"
                radius="full"
                color="default"
                size="sm"
                isIconOnly
                className="absolute -top-3 right-1/2 translate-x-1/2 !z-[10]"
                onClick={open}
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
            {/* <ul>{files}</ul> */}
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
          className="tiptap"
          spellCheck={"false"}
        />
      </div>
    </div>
  )
}