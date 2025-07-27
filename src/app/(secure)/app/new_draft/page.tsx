"use client"

import { useState } from "react";
import BlockEditor from '@/components/editor';
import ModalDraftDetails from '@/components/pannels/ModalDraftDetails';
import EditorToolbar from "@/components/editor/toolbars/EditorToolbar";
import { useBlockEditor } from "@/components/editor/hooks/useBlockEditor";

export default function Page() {
  const [doc, setDoc] = useState<any>();
  const [characterCount, setCharacterCount] = useState({
    words: () => 0,
    characters: () => 0,
  });

  const { editor } = useBlockEditor({
    editable: true,
    autoFocus: false,
    debouncedUpdates: () => {}
  });

  return (
    <div className="w-full flex flex-col h-[calc(100dvh-65px)] md:pt-10 pb-14 z-50 bg-content1 relative">
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

      <EditorToolbar editor={editor} />

      <ModalDraftDetails
        doc={doc}
        characterCount={characterCount}
      />
    </div>
  )
}