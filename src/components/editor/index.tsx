"use client";

import 'katex/dist/katex.min.css';
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { getLocalStorageWithExpiry, setLocalStorageWithExpiry } from "@/app/_helpers/storage";
import { EditorContent } from "@tiptap/react";
import ImageBlockMenu from "./extensions/ImageBlock/components/ImageBlockMenu";
import ContentItemMenu from "./menus/ContentItemMenu";
import EditorToolbar from "./toolbars/EditorToolbar";
import { Button, Input } from '@heroui/react';
import { CircleArrowRight } from 'lucide-react';
import { NextSessionContext } from '@/contexts/SessionContext';

export default function BlockEditor({
  doc,
  editable,
  autoFocus,
  debouncedUpdates,
  onAddComment,
}: {
  doc?: any,
  editable: boolean,
  autoFocus: boolean,
  debouncedUpdates: Function,
  onAddComment?: Function,
}) {
  const menuContainerRef = useRef(null);
  
  const { session } = useContext(NextSessionContext);
  const userID = session?.user?.id

  const [localDoc, setLocalDoc] = useState(() => {
    const savedDoc = getLocalStorageWithExpiry('editor-document');
    return savedDoc || {
      content: '',
      cover: null,
      title: 'New Document',
    };
  });
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const { editor } = useBlockEditor({
    doc: localDoc,
    editable: editable,
    autoFocus: autoFocus,
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

  const canEditDraft = useCallback(() => {
    return localDoc?.authorId === userID && editable;
  }, [localDoc?.authorId, editable, userID]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const isInsideComment = editor.isActive('comment-highlight');

      setShowMenu(isInsideComment);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    handleSelectionUpdate();


    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  if (!editor) return

  return (
    <div className="w-full flex gap-5 mx-auto">
      <div ref={menuContainerRef} className="w-full max-w-[768px] 2xl:max-w-[1024px] mx-auto relative flex flex-col bg-background flex-1 md:rounded-lg z-[1] md:border md:border-divider overflow-hidden">
        {/* Fixed Top Bar */}
        {canEditDraft() &&
          <EditorToolbar editor={editor} />
        }

        {/* Scrollable Editor */}
        <div className="pt-10 px-5 pb-5 z-10 overflow-y-auto h-[calc(100vh-85px)]">
          {editor && (
            <>
            {canEditDraft() &&
              <>
                <ContentItemMenu editor={editor} />
                {/* <TableRowMenu editor={editor} appendTo={menuContainerRef} /> */}
                {/* <TableColumnMenu editor={editor} appendTo={menuContainerRef} /> */}
                <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
              </>
            }

              <EditorContent
                editor={editor}
                className="tiptap editableClass h-full"
                spellCheck="false"
              />
            </>
          )}
        </div>
      </div>

      {showMenu &&
        <div className="w-[250px] bg-background rounded-xl shadow flex gap-2 p-1">
          <Input
            name="comment"
            autoFocus={true}
            placeholder="Enter some text"
          />

          <Button
            isIconOnly={true}
            color="primary"
            variant="light"
            onPress={() => {
              if (onAddComment) {
                onAddComment(editor)
              }
            }}
          >
            <CircleArrowRight />
          </Button>
        </div>
      }
    </div>
  )
}