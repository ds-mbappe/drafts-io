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
import TableRowMenu from "./extensions/Table/menus/TableRow/TableRow";
import TableColumnMenu from "./extensions/Table/menus/TableColumn/TableColumn";
import ImageBlockMenu from "./extensions/ImageBlock/components/ImageBlockMenu";

export default function BlockEditor({ documentId, doc, setSaveStatus, currentUser }: {
  documentId: String,
  doc: any,
  setSaveStatus: Function,
  // yDoc: YDoc | null,
  currentUser: any,
  // provider: TiptapCollabProvider | null,
  // updateHistoryData: Function | null,
}) {
  const router = useRouter();

  const menuContainerRef = useRef(null);

  const [isPending, startTransition] = useTransition();

  // Simulate a delay in saving.
  const debouncedUpdates = useDebouncedCallback(async ({ editor }: { editor: Editor }) => {
    const editorData = editor?.getHTML();
    await patchRequest(documentId, editorData);
    setSaveStatus("Synced");
    // setTimeout(() => {
    //   if (provider?.isAuthenticated) {
    //     setSaveStatus("Synced");
    //   } else {
    //     setSaveStatus("Not Synced");
    //   }
    // }, 500);
  }, 1000);

  // const UpdateHistoryVersions = useDebouncedCallback(() => {
  //   if (editor?.can().saveVersion()) {
  //     // console.log("Can save new version")
  //   }
  // }, 30000)

  const { editor } = useBlockEditor({
    // yDoc,
    // provider,
    doc,
    currentUser,
    // updateHistoryData,
    setSaveStatus,
    debouncedUpdates,
    // UpdateHistoryVersions
  });
  
  const patchRequest = async (documentId: String, document: any) => {
    const response = await fetch(`/api/document/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: document,
        word_count: editor?.storage.characterCount?.words(),
        character_count: editor?.storage.characterCount?.characters(),
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

    // if (provider?.isAuthenticated) {
    //   setSaveStatus("Synced");
    // } else {
    //   setSaveStatus("Not Synced");
    // }

    // Force a cache invalidation.
    startTransition(() => {
      router.refresh();
    });
  }

  if (!editor || !doc || !currentUser) return

  return (
    <div className="relative w-full flex min-h-screen cursor-text flex-col items-start">
      <div className="flex flex-col gap-10 relative w-full max-w-screen-xl mx-auto py-24 px-20 lg:px-16" ref={menuContainerRef}>
        <div className="w-full h-[400px] mx-auto max-w-7xl bg-warning-50">

        </div>

        {
          doc?.authorId === currentUser?.id ?
            <>
              <ContentItemMenu editor={editor} />
              <LinkMenu editor={editor} appendTo={menuContainerRef} />
              <TextMenu editor={editor} />
              <TableRowMenu editor={editor} appendTo={menuContainerRef} />
              <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
              <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
            </>
            :
            <></>
        }
        <EditorContent
          editor={editor}
          className="tiptap z-0"
          spellCheck={"false"}
        />
      </div>
    </div>
  )
}