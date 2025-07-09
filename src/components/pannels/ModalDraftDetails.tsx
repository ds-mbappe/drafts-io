import React, { useCallback, useContext, useState } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Button, Input, Spinner } from "@heroui/react"
import { errorToast } from '@/actions/showToast';
import { PencilIcon } from 'lucide-react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { useDropzone } from 'react-dropzone';
import { EditorContent } from '@tiptap/react';
import { useBlockEditor } from '../editor/hooks/useBlockEditor';

const ModalDraftDetails = ({ doc, isOpen, onOpenChange, onDraftUpdated }: {
  doc?: any,
  isOpen: boolean | undefined,
  onOpenChange: () => void | undefined,
  onDraftUpdated: Function,
}) => {
  const { editor } = useBlockEditor({
    doc: doc,
    editable: false,
    autoFocus: false,
    setSaveStatus: () => {},
    debouncedUpdates: () => {}
  });
  const { session } = useContext(NextSessionContext)

  const [titleValue, setTitleValue] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const onDrop = useCallback(async(acceptedFiles: any) => {
    setUploadLoading(true)

    // const file = acceptedFiles?.[0]

    // if (file) {
    //   const timestamp = Math.round((new Date).getTime()/1000)
    //   const signature = cloudinary.utils.api_sign_request({
    //     timestamp: timestamp,
    //     folder: "cover_urls",
    //   }, process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET as string )

    //   const formData = new FormData()
    //   formData.append('file', file)
    //   formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string)
    //   formData.append('signature', signature)
    //   formData.append('timestamp', JSON.stringify(timestamp))
    //   formData.append('folder', 'cover_urls')

    //   const result = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string}/auto/upload`, {
    //     method: 'POST',
    //     body: formData,
    //   })
    //   if (result?.ok) {
    //     const data = await result.json()
    //     const formData = {
    //       cover: data?.url,
    //       // word_count: editor?.storage.characterCount?.words(),
    //       // character_count: editor?.storage.characterCount?.characters(),
    //     }
    //     const response = await updateDocument(doc?.id, formData);

    //     if (response?.ok) {
    //       successToast(`Document cover updated!`)
    //       onDraftUpdated();
    //     } else {
    //       errorToast(`Error updating document cover, please try again!`)
    //     }
    //   } else {
    //     errorToast(`Error uploading image, please try again!`)
    //   }
    // }
    
    setUploadLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, open } = useDropzone({
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop,
    onDropRejected() {
      errorToast(`File format not supported, accepted formats are ".png, .jpg, .jpeg, .gif, .avif, .webp"`)
    },
    accept: {
      'image/png': ['.png', '.jpg', '.jpeg', '.gif', '.avif', '.webp']
    }
  })

  const isTitleInvalid = () => {
    // return (titleValue === doc?.title || titleValue?.length < 1)
    return false;
  }

  const onSaveDraftDetails = () => {
    onDraftUpdated(titleValue);
    onOpenChange();
  }

  return (
    <Modal hideCloseButton scrollBehavior="inside" isOpen={isOpen} placement="center" size="3xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onCloseCreateDraft) => (
          <>
            <ModalHeader>
              {"Draft details"}
            </ModalHeader>

            <ModalBody className="w-full flex flex-col gap-5 mx-auto px-5 md:px-10">
              <div className="flex gap-1 justify-between items-start">
                <Input
                  isClearable
                  errorMessage={"Enter at lest one character !"}
                  value={titleValue}
                  variant="bordered"
                  label="Draft title"
                  onValueChange={setTitleValue}
                />
              </div>

              {/* <div className="w-full flex flex-col md:!flex-row items-start md:!items-center gap-5 md:!gap-0 justify-start md:!justify-between">
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
                      Written by {doc?.authorId === session?.user?.id ? `You` : `${doc?.authorFirstname} ${doc?.authorLastname}`}
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

                {doc?.authorId !== session?.user?.id &&
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
              </div> */}

              {doc?.cover ?
                // Show cover if it's present
                <div {...getRootProps()} className="w-full h-[350px] flex justify-center items-center max-w-3xl mx-auto cursor-default relative px-5 md:!px-0">
                  <input {...getInputProps()} />

                  <div
                    className="w-full h-[350px] rounded-[12px] max-w-3xl flex justify-center items-center bg-cover bg-center overflow-hidden border border-divider"
                    style={{backgroundImage: `url(${doc?.cover})`}}
                  />

                  {doc?.authorId === session?.user?.id &&
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
                      className="w-full h-[350px] flex flex-col"
                    >
                      <input {...getInputProps()} />

                      <div className="w-full h-[350px] flex flex-col gap-8 items-center justify-center">
                        <p className={isDragActive ? "text-primary font-medium text-xl" : "font-medium text-xl"}>
                          {isDragActive ? "Release to drop file" : "Drag and drop an image to upload"}
                        </p>

                        {!isDragActive &&
                          <Button
                            color="default"
                            variant={"bordered"}
                            className="w-fit font-medium"
                            onPress={open}
                          >
                            {'Select image'}
                          </Button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              {editor &&
                <EditorContent
                  editor={editor}
                  className="tiptap readOnlyClass"
                  spellCheck={"false"}
                />
              }
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onCloseCreateDraft}>
                {'Cancel'}
              </Button>

              <Button color="primary" variant="light" onPress={onSaveDraftDetails} isLoading={loading}>
                {doc?.id ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

ModalDraftDetails.displayName = 'ModalDraftDetails'

export default ModalDraftDetails