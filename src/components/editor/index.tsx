"use client";

import { Editor, EditorContent, useEditor } from "@tiptap/react";
import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import { ExtensionKit } from './extensions/extension-kit';
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import CollaborationHistory, { CollabOnUpdateProps } from '@tiptap-pro/extension-collaboration-history';
import { useBlockEditor } from "./hooks/useBlockEditor";
import { Button } from "../ui/button";
import type { Doc as YDoc } from 'yjs'
import { TiptapCollabProvider } from "@hocuspocus/provider";
import { LinkMenu } from './menus/LinkMenu'
import { TextMenu } from './menus/TextMenu/TextMenu'
import { toast } from "sonner";

export default function BlockEditor({ documentId, documentContent, setCharacterCount, setSaveStatus, yDoc, provider, userFullName, updateHistoryData }: {
  documentId: String,
  documentContent: String | null,
  setSaveStatus: Function,
  setCharacterCount: Function,
  yDoc: YDoc,
  provider: TiptapCollabProvider | undefined,
  userFullName: String,
  updateHistoryData: Function,
}) {
  const router = useRouter();

  const menuContainerRef = useRef(null);

  const [isPending, startTransition] = useTransition();

  const updateStatusAndCount = (characterCount: any) => {
    setCharacterCount(characterCount)
  }

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(async ({ editor }: { editor: Editor }) => {
    const editorData = editor.getHTML();
    await patchRequest(documentId, editorData);
    setTimeout(() => {
      if (provider?.isAuthenticated) {
        setSaveStatus("Synced");
      } else {
        setSaveStatus("Not Synced");
      }
    }, 500);
  }, 1000);

  const UpdateHistoryVersions = useDebouncedCallback(() => {
    if (editor?.can().saveVersion()) {
      // console.log("Can save new version")
    }
  }, 30000)

  const { editor } = useBlockEditor({
    yDoc,
    provider,
    userFullName,
    updateHistoryData,
    setSaveStatus,
    updateStatusAndCount,
    debouncedUpdates,
    UpdateHistoryVersions
  });
  
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
      toast.error(`Error`, {
        description: `Failed to update document, please try again !`,
        duration: 3000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
    }

    if (provider?.isAuthenticated) {
      setSaveStatus("Synced");
    } else {
      setSaveStatus("Not Synced");
    }

    // Force a cache invalidation.
    startTransition(() => {
      router.refresh();
    });
  }

  if (!editor) return

  return (
    <div className="relative w-full flex min-h-screen cursor-text flex-col items-start">
      <div className="relative w-full max-w-screen-xl" ref={menuContainerRef}>
        <ContentItemMenu editor={editor} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <EditorContent editor={editor} className="tiptap" spellCheck={"false"} />
      </div>
    </div>
  )
}