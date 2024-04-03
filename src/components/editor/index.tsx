"use client";

import { EditorContent, PureEditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import React, { useRef, useState } from 'react';
import Navbar from "@/components/ui/navbar";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function BlockEditor() {
  const router = useRouter();
  const { editor, characterCount } = useBlockEditor();
  const menuContainerRef = useRef(null);
  const testData = {
    title: "My document",
    private: false,
    team_id: "",
    can_edit: true,
  }
  const [formData, setFormData] = useState(testData)
  const editorRef = useRef<PureEditorContent | null>(null);

  const handleSaveData = async () => {
    const res = await fetch("/api/documents", {
      method: "POST",
      body: JSON.stringify({ formData }),
      "content-type": "application/json"
    })

    if (!res.ok) {
      throw new Error("Failed to create document.")
    }

    router.refresh()
    router.push("/")
  };

  return (
    <div className="w-full h-full flex flex-col">
      { editor ?
        <>
          <Navbar words={characterCount.words()} characters={characterCount.characters()} />
          
          <div
            onClick={() => { editor?.chain().focus().run(); }}
            className="relative flex w-full min-h-screen cursor-text flex-col items-center p-6"
          >
            <div className="relative w-full max-w-screen-lg">
              <Button onClick={handleSaveData}>Save</Button>
              <EditorContent editor={editor} ref={editorRef} className="flex-1 overflow-y-auto" />
            </div>
          </div>
        </> :
        <>
          <div>
            Loading
          </div>
        </>
      }
    </div>
  );
}