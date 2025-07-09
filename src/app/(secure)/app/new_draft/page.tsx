"use client"

import { memo, useContext, useState } from "react";
import { Button, useDisclosure } from "@heroui/react";
import ModalDraftDetails from '@/components/pannels/ModalDraftDetails';
import { clearLocalStorageKey } from '@/app/_helpers/storage';
import { createDocument } from '@/actions/document';
import { errorToast, successToast } from '@/actions/showToast';
import { NextSessionContext } from '@/contexts/SessionContext';
import BlockEditor from '@/components/editor';

export default function Page() {
  const EDITOR_LOCAL_STORAGE_KEY: string = 'editor-document';

  const [doc, setDoc] = useState<any>();
  const [characterCount, setCharacterCount] = useState({
    characters: () => 0,
    words: () => 0
  });

  const MemoButton = memo(Button);

  const { isOpen, onOpenChange } = useDisclosure();
  const { session } = useContext(NextSessionContext);
  const user = session?.user

  const onCreateDocument = async (title: string) => {
    const formData = {
      title: title,
      cover: null,
      content: doc?.content,
      authorId: user?.id,
      authorFirstname: '',
      authorLastname: '',
      word_count: characterCount?.words(),
      character_count: characterCount?.characters(),
    }
    const response = await createDocument({...formData});

    if (response?.success) {
      clearLocalStorageKey(EDITOR_LOCAL_STORAGE_KEY);

      successToast("Document successfully created !");
    } else {
      errorToast("An error occured, please try again !");
    }
  }

  return (
    <div className="w-full h-[calc(100vh-65px)] flex md:py-10 z-50 bg-background relative">
      <MemoButton className="absolute bottom-10 right-10 z-50" color="primary" title="Save draft" onPress={onOpenChange}>
        {"Create Draft"}
      </MemoButton>

      <BlockEditor
        editable
        autoFocus
        setSaveStatus={() => {}}
        debouncedUpdates={({ updatedDoc, characterCount }: {
          updatedDoc: any,
          characterCount: any
        }) => {
          setDoc(updatedDoc);
          setCharacterCount(characterCount);
        }}
      />

      <ModalDraftDetails
        doc={doc}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onDraftUpdated={(title: string) => {
          if (title) {
            onCreateDocument(title);
          }
        }}
      />
    </div>
  )
}