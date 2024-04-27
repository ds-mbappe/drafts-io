"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import React, { useState, useEffect, useTransition } from "react";
import { ExtensionKit } from './extensions/extension-kit';
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function BlockEditor({ documentId, documentContent, setCharacterCount, setSaveStatus }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // const [saveStatus, setSaveStatus] = useState("Saved");
  const [hydrated, setHydrated] = useState(false);
  const [content, setContent] = useState(null);

  const patchRequest = async (documentId: String, document: any) => {
    const response = await fetch(`/api/document/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: document,
      }),
    });

    if (!response.ok) {
      setSaveStatus("Waiting to Save.");
      throw new Error("Failed to update document");
    }

    setSaveStatus("Saved");

    startTransition(() => {
      // Force a cache invalidation.
      router.refresh();
    });
  }

  const updateStatusAndCount = () => {
    setCharacterCount(editor?.storage.characterCount)
  }

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const editorData = editor.getHTML();
    setContent(editorData);
    await patchRequest(documentId, editorData);
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
  }, 1000);

  const editor = useEditor({
    extensions: [...ExtensionKit()],
    content: content,
    onUpdate: (e) => {
      updateStatusAndCount()
      setSaveStatus("Saving...");
      debouncedUpdates(e);
    }
  })

  // Hydrate the editor with the content from the database.
  useEffect(() => {
    if (editor && documentContent && !hydrated) {
      editor.commands.setContent(documentContent.content);
      updateStatusAndCount();
      setHydrated(true);
    }
  }, [editor, documentContent, hydrated]);

  return (
    <div
      onClick={() => { editor?.chain().focus().run(); }}
      className="relative w-full flex min-h-screen cursor-text flex-col items-start"
    >
      <div className="relative w-full max-w-screen-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}