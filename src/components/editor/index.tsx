"use client";

import 'katex/dist/katex.min.css';
import React, { useEffect, useRef, useState } from "react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { getLocalStorageWithExpiry, setLocalStorageWithExpiry } from "@/app/_helpers/storage";
import { EditorContent } from "@tiptap/react";
import ImageBlockMenu from "./extensions/ImageBlock/components/ImageBlockMenu";
import ContentItemMenu from "./menus/ContentItemMenu";
import EditorToolbar from "./toolbars/EditorToolbar";

export default function BlockEditor({
  doc,
  editable,
  autoFocus,
  setSaveStatus,
  debouncedUpdates,
}: {
  doc?: any,
  editable: boolean,
  autoFocus: boolean,
  setSaveStatus: Function,
  debouncedUpdates: Function,
}) {
  const menuContainerRef = useRef(null);

  const [localDoc, setLocalDoc] = useState(() => {
    const savedDoc = getLocalStorageWithExpiry('editor-document');
    return savedDoc || {
      content: '',
      cover: null,
      title: 'New Document',
    };
  });

  const { editor } = useBlockEditor({
    doc: localDoc,
    editable: editable,
    autoFocus: autoFocus,
    setSaveStatus: () => setSaveStatus(),
    debouncedUpdates: () => {
      const editorContent = editor?.getHTML();
      
      setLocalDoc((oldValue: any) => {
        const updatedDoc = {
          ...oldValue,
          content: editorContent ?? '',
          updatedAt: new Date().toISOString()
        };

        if (!doc?.id) {
          setLocalStorageWithExpiry({
            key: 'editor-document',
            value: updatedDoc,
          });
        }
        
        return updatedDoc;
      });

      const updatedDoc = {
        ...localDoc,
        content: editorContent ?? '',
        updatedAt: new Date().toISOString()
      }
      const characterCount = editor?.storage.characterCount;

      debouncedUpdates({
        updatedDoc,
        characterCount,
      })
    }
  });

  useEffect(() => {
    if (doc?.id) {
      setLocalDoc(doc);
    }
  }, [doc]);

  if (!editor) return

  return (
    <div ref={menuContainerRef} className="w-full max-w-[768px] 2xl:max-w-[1024px] mx-auto relative flex flex-col bg-background flex-1 md:rounded-lg z-[1] md:border md:border-divider overflow-hidden">
      {/* Fixed Top Bar */}
      <EditorToolbar editor={editor} />

      {/* Scrollable Editor */}
      <div className="pt-10 px-5 pb-5 z-10 overflow-y-auto h-[calc(100vh-85px)]">
        {editor && (
          <>
            <ContentItemMenu editor={editor} />
            {/* <TableRowMenu editor={editor} appendTo={menuContainerRef} /> */}
            {/* <TableColumnMenu editor={editor} appendTo={menuContainerRef} /> */}
            <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />

            <EditorContent
              editor={editor}
              className="tiptap editableClass h-full"
              spellCheck="false"
            />
          </>
        )}
      </div>
    </div>
  )
}