"use client"

import { useState } from "react";
import BlockEditor from '@/components/editor';
import ModalDraftDetails from '@/components/pannels/ModalDraftDetails';

export default function Page() {
  const [doc, setDoc] = useState<any>();
  const [characterCount, setCharacterCount] = useState({
    words: () => 0,
    characters: () => 0,
  });

  return (
    <div className="w-full flex flex-col h-[calc(100dvh-65px)] md:py-10 z-50 bg-background relative">
      <BlockEditor
        editable
        autoFocus
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
        characterCount={characterCount}
      />
    </div>
  )
}