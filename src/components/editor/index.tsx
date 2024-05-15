"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import React, { useState, useEffect, useTransition } from "react";
import { ExtensionKit } from './extensions/extension-kit';
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import { useBlockEditor } from "./hooks/useBlockEditor";

export default function BlockEditor({ documentId, documentContent, setCharacterCount, setSaveStatus, yDoc, provider }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { initialContent } = useBlockEditor();

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

    setSaveStatus("Synced");

    // Force a cache invalidation.
    startTransition(() => {
      router.refresh();
    });
  }

  const updateStatusAndCount = () => {
    setCharacterCount(editor?.storage.characterCount)
  }

  const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16)
  }

  const userColor = `#${randomColor()}`

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const editorData = editor.getHTML();
    await patchRequest(documentId, editorData);
    setTimeout(() => {
      setSaveStatus("Synced");
    }, 500);
  }, 1000);

  const editor = useEditor({
    autofocus: true,
    onCreate: ({ editor }) => {
      provider?.on('synced', () => {
        if (editor.isEmpty) {
          editor.commands.setContent(initialContent)
        }
      })
    },
    extensions: [
      ...ExtensionKit(),
      Collaboration.configure({
        document: yDoc,
      }),
    ],
    onUpdate: (e) => {
      updateStatusAndCount()
      setSaveStatus("Syncing...");
      debouncedUpdates(e);
    }
  }, [yDoc, provider])

  if (!editor) return false

  return (
    <div
      onClick={() => { editor?.chain().focus().run(); }}
      className="relative w-full flex min-h-screen cursor-text flex-col items-start"
    >
      <div className="relative w-full max-w-screen-lg">
        <ContentItemMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}