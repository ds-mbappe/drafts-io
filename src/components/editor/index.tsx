"use client";

import 'katex/dist/katex.min.css';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { getLocalStorageWithExpiry, setLocalStorageWithExpiry } from "@/app/_helpers/storage";
import { EditorContent } from "@tiptap/react";
import EditorToolbar from "./toolbars/EditorToolbar";
import { NextSessionContext } from '@/contexts/SessionContext';
import CommentBubble from '../pannels/CommentBubble';

const BlockEditor = forwardRef(({
  doc,
  editable,
  autoFocus,
  debouncedUpdates,
}: {
  doc?: any,
  editable: boolean,
  autoFocus: boolean,
  debouncedUpdates: Function,
}, ref) => {
  const menuContainerRef = useRef(null);
  
  const { session } = useContext(NextSessionContext);
  const user = session?.user;
  const userID = session?.user?.id;

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
    debouncedUpdates: () => {
      if (editor) {
        const editorContent = editor.getHTML();
        const { from, to } = editor.state.selection;
        
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
    }
  });

  const isDraft = useMemo(() => (!localDoc?.id), [localDoc?.id]);
  const canEditDraft = useMemo(() => {
    return localDoc?.author?.id === userID && editable;
  }, [localDoc?.author?.id, userID, editable]);

  // useEffect update localDoc values
  useEffect(() => {
    if (doc?.id) {
      setLocalDoc(doc);
    }
  }, [doc]);

  useImperativeHandle(ref, () => ({
    editor,
  }));

  if (!editor) return

  return (
    <div className="w-full flex gap-5 relative justify-center">
      <div ref={menuContainerRef} className="w-full max-w-[768px] 2xl:max-w-[1024px] relative flex flex-col bg-background md:rounded-lg z-[1] md:border md:border-divider overflow-hidden">
        {/* Fixed Top Bar */}
        {(isDraft || canEditDraft) &&
          <EditorToolbar editor={editor} />
        }

        {/* Scrollable Editor */}
        <div className="pt-14 px-5 pb-5 z-10">
          {editor && (
            <>
              {(isDraft || canEditDraft) &&
                <>
                  {/* <ContentItemMenu editor={editor} /> */}
                  {/* <TableRowMenu editor={editor} appendTo={menuContainerRef} /> */}
                  {/* <TableColumnMenu editor={editor} appendTo={menuContainerRef} /> */}
                  {/* <ImageBlockMenu editor={editor} appendTo={menuContainerRef} /> */}
                </>
              }

              <EditorContent
                editor={editor}
                spellCheck="false"
                key={"page-editor"}
                className="tiptap editableClass h-full"
              />
            </>
          )}
        </div>
      </div>

      {localDoc?.id &&
        <CommentBubble
          editor={editor}
          documentId={localDoc?.id}
          user={{
            id: user?.id,
            avatar: user?.avatar,
            lastname: user?.lastname,
            firstname: user?.firstname,
          }}
        />
      }
    </div>
  )
})

BlockEditor.displayName = 'BlockEditor'

export default BlockEditor;