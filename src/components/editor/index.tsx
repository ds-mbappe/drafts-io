"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import React, { useState, useEffect, useTransition } from "react";
import { ExtensionKit } from './extensions/extension-kit';
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import ContentItemMenu from '@/components/editor/menus/ContentItemMenu';
import CollaborationHistory, { CollabOnUpdateProps } from '@tiptap-pro/extension-collaboration-history';
import { useBlockEditor } from "./hooks/useBlockEditor";

export default function BlockEditor({ documentId, documentContent, setCharacterCount, setSaveStatus, yDoc, provider, userFullName, updateHistoryData }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { initialContent } = useBlockEditor();
  // const [versions, setVersions] = useState([]);
  // const [isAutoVersioning, setIsAutoVersioning] = useState(false);
  // const [latestVersion, setLatestVersion] = useState(null);
  // const [currentVersion, setCurrentVersion] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

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

  const UpdateHistoryVersions = useDebouncedCallback(() => {
    editor?.commands.saveVersion()
  }, 1500)

  const onUpdate = () => {
    setHasChanges(true)
  }

  const onSynced = () => {
    yDoc.on('update', onUpdate)
  }

  const editor = useEditor({
    autofocus: true,
    onCreate: ({ editor }) => {
      provider?.on('synced', () => {
        onSynced();
        // if (editor.isEmpty) {
        //   editor.commands.setContent(initialContent)
        // }
      })
      // provider?.on('authenticationFailed', async() => {
      //   console.log("The authentication has failed !")
      // })
    },
    extensions: [
      ...ExtensionKit(),
      Collaboration.configure({
        document: yDoc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: userFullName,
          color: userColor,
        },
      }),
      CollaborationHistory.configure({
        provider,
        onUpdate: (data: any) => {
          updateHistoryData(data)
          // console.log(data)
          // setVersions(data.versions)
          // setIsAutoVersioning(data.versioningEnabled)
          // setLatestVersion(data.version)
          // setCurrentVersion(data.currentVersion)
        },
      }),
    ],
    onUpdate: (e) => {
      updateStatusAndCount()
      setSaveStatus("Syncing...");
      debouncedUpdates(e);
      UpdateHistoryVersions()
    }
  }, [])

  if (!editor) return

  return (
    <div
      onClick={() => { editor?.chain().focus().run(); }}
      className="relative w-full flex min-h-screen cursor-text flex-col items-start"
    >
      <div className="relative w-full max-w-screen-xl">
        <ContentItemMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}