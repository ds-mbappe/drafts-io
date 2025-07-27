import React, { memo, useCallback, useContext, useState } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Button, Input, useDisclosure, Textarea, Select, SelectItem } from "@heroui/react"
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
import { useMobile } from '@/hooks/useMobile';
import { useDebouncedCallback } from 'use-debounce';

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
  const isLargeScreen = useMobile();
  const { isOpen, onOpenChange } = useDisclosure();
  const { session } = useContext(NextSessionContext)
  const user = session?.user

  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [titleValue, setTitleValue] = useState<string>('');
  const [intro, setIntro] = useState<string>('');
  const [topic, setTopic] = useState<string>('');

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTopic(e.target.value);
  };
  
  const onDrop = useCallback(async(acceptedFiles: any) => {
    const file = acceptedFiles?.[0];

    if (file) {
      const localUrl = URL.createObjectURL(file);

      setCover(localUrl)
      setCoverFile(file)
    }  
  }, [])

  const categories = [
    { value: 'technology', title: 'Technology' },
    { value: 'lifestyle', title: 'Lifestyle' },
    { value: 'business', title: 'Business' },
    { value: 'design', title: 'Design' },
    { value: 'innovation', title: 'Innovation' },
    { value: 'education', title: 'Education' },
  ]

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

  const onCreateDocument = useDebouncedCallback(async () => {
    setLoading(true)

    const uploadedFileUrl = await uploadFileToCloudinary(coverFile);

    const formData = {
      intro: intro,
      topic: topic,
      title: titleValue,
      authorId: user?.id,
      content: doc?.content,
      cover: uploadedFileUrl ?? null,
      word_count: characterCount?.words(),
      character_count: characterCount?.characters(),
    }
    const response = await createDocument({...formData});

    const documentID = response.document?.id;

    if (response?.success) {
      clearLocalStorageKey(EDITOR_LOCAL_STORAGE_KEY);

      successToast("Story successfully created !");

      router.push(`/app/${documentID}`);
    } else {
      errorToast("An error occured, please try again !");
    }

    setLoading(false)
  }, 300)

  const isTitleInvalid = () => {
    return !titleValue
  }

  const isIntroInvalid = () => {
    return !intro
  }

  const isTopicInvalid = () => {
    return !topic
  }

  const closeAndResetModal = () => {
    onOpenChange();
    setTitleValue('');
    setIntro('');
    setTopic('');
  }

  const onSaveDraftDetails = () => {
    if (isTitleInvalid()) {
      infoToast("Please fill the Story title !");
      return;
    }

    if (isIntroInvalid()) {
      infoToast("Please fill an intro !");
      return;
    }

    if (isTopicInvalid()) {
      infoToast("Please choose a topic !");
      return;
    }

    onCreateDocument();
  }

  return (
    <>
      <MemoButton
        color="primary"
        title="Save draft"
        className="fixed bottom-5 right-5 z-50"
        onPress={onOpenChange}
      >
        {"Create Story"}
      </MemoButton>

      <Modal
        hideCloseButton
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        size={isLargeScreen ? "3xl" : "full"}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onCloseCreateDraft) => (
            <>
              <ModalHeader>
                {"Story details"}
              </ModalHeader>

              <ModalBody className="w-full flex flex-col gap-5 mx-auto px-5">
                <Input
                  isRequired
                  isClearable
                  value={titleValue}
                  variant="bordered"
                  label="Story title"
                  onValueChange={setTitleValue}
                  errorMessage={"Enter at lest one character !"}
                />

                <Select
                  isRequired
                  label="Category"
                  variant="bordered"
                  selectedKeys={[topic]}
                  showScrollIndicators={false}
                  onChange={handleSelectionChange}
                  placeholder="Select a category"
                  errorMessage={"Please select a category !"}
                >
                  {categories.map((category) => (
                    <SelectItem key={category.value}>
                      {category.title}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  isRequired
                  isClearable
                  value={intro}
                  variant="bordered"
                  label="Intro"
                  onValueChange={setIntro}
                  placeholder="A small description text describing what the Story is about"
                />

                <div>
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
                        <div
                          className="bg-cover bg-center w-full h-[350px] md:h-[450px]"
                          style={{
                            backgroundImage: `url(${cover})`
                          }}
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
                </div>

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
                  onPress={closeAndResetModal}
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