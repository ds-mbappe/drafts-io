import React, { memo, useCallback, useContext, useEffect, useState } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Button, Input, Image, useDisclosure } from "@heroui/react"
import { errorToast, infoToast, successToast } from '@/actions/showToast';
import { CloudUploadIcon } from 'lucide-react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { useDropzone } from 'react-dropzone';
import { EditorContent } from '@tiptap/react';
import { useBlockEditor } from '../editor/hooks/useBlockEditor';
import { createDocument } from '@/actions/document';
import { clearLocalStorageKey } from '@/app/_helpers/storage';
import { uploadFileToCloudinary } from '@/app/_helpers/cloudinary';
import { useRouter } from 'next/navigation';

const ModalDraftDetails = ({ doc, characterCount }: {
  doc?: any,
  characterCount?: {
    words: () => 0,
    characters: () => 0,
  }
}) => {
  const EDITOR_LOCAL_STORAGE_KEY: string = 'editor-document';

  const MemoButton = memo(Button);

  const router = useRouter();
  const { editor } = useBlockEditor({
    doc: doc,
    editable: false,
    autoFocus: false,
    debouncedUpdates: () => {}
  });
  const { isOpen, onOpenChange } = useDisclosure();
  const { session } = useContext(NextSessionContext)
  const user = session?.user

  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [titleValue, setTitleValue] = useState<string>('');
  
  const onDrop = useCallback(async(acceptedFiles: any) => {
    const file = acceptedFiles?.[0];

    if (file) {
      const localUrl = URL.createObjectURL(file);

      setCover(localUrl)
      setCoverFile(file)
    }  
  }, [])

  const { getRootProps, getInputProps, open } = useDropzone({
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
  });

  const onCreateDocument = async () => {
    setLoading(true)

    const uploadedFileUrl = await uploadFileToCloudinary(coverFile);

    const formData = {
      title: titleValue,
      authorId: user?.id,
      cover: uploadedFileUrl ?? null,
      content: doc?.content,
      word_count: characterCount?.words(),
      character_count: characterCount?.characters(),
    }
    const response = await createDocument({...formData});

    const documentID = response.document?.id;

    if (response?.success) {
      clearLocalStorageKey(EDITOR_LOCAL_STORAGE_KEY);

      successToast("Document successfully created !");

      router.push(`/app/${documentID}`);
    } else {
      errorToast("An error occured, please try again !");
    }

    setLoading(false)
  }

  const isTitleInvalid = () => {
    return !titleValue
  }

  const onSaveDraftDetails = () => {
    if (isTitleInvalid()) {
      infoToast("Please fill the Draft title !");

      return;
    }

    onCreateDocument();
  }

  return (
    <>
      <MemoButton
        color="primary"
        title="Save draft"
        className="absolute bottom-10 right-10 z-50"
        onPress={onOpenChange}
      >
        {"Create Draft"}
      </MemoButton>

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
                    value={titleValue}
                    variant="bordered"
                    label="Draft title"
                    onValueChange={setTitleValue}
                    errorMessage={"Enter at lest one character !"}
                  />
                </div>

                <Button
                  onPress={open}
                  variant="light"
                  className="w-full h-[350px] md:h-[450px] px-0"
                >
                  <div
                    {...getRootProps()}
                    className="w-full flex justify-center items-center max-w-3xl mx-auto relative px-0"
                  >
                    <input {...getInputProps()} />

                    {cover &&
                      <Image
                        src={cover}
                        height={350}
                        alt="cover"
                        className="w-full border border-divider"
                      />
                    }

                    {!cover &&
                      <div className="w-full h-[350px] md:h-[450px] rounded-[12px] gap-1 max-w-3xl flex flex-col justify-center items-center bg-cover bg-center overflow-hidden border border-divider">
                        <CloudUploadIcon
                          width={80}
                          height={80}
                          className="text-foreground"
                        />

                        <p className="text-foreground text-center">
                          <span className="underline">{ "Click to upload" }</span>
                          { " or drag and drop" }
                        </p>
                      </div>
                    }
                  </div>
                </Button>

                {editor &&
                  <EditorContent
                    editor={editor}
                    className="tiptap readOnlyClass"
                    spellCheck={"false"}
                  />
                }
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onCloseCreateDraft}
                >
                  {'Cancel'}
                </Button>

                <Button
                  color="primary"
                  variant="light"
                  isLoading={loading}
                  onPress={onSaveDraftDetails}
                >
                  {'Create draft'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

ModalDraftDetails.displayName = 'ModalDraftDetails'

export default ModalDraftDetails