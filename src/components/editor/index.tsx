"use client";

import 'katex/dist/katex.min.css';
import React, { forwardRef, ReactNode, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { getLocalStorageWithExpiry, setLocalStorageWithExpiry } from "@/app/_helpers/storage";
import { EditorContent } from "@tiptap/react";
import ImageBlockMenu from "./extensions/ImageBlock/components/ImageBlockMenu";
import ContentItemMenu from "./menus/ContentItemMenu";
import EditorToolbar from "./toolbars/EditorToolbar";
import { Avatar, Button, Input } from '@heroui/react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { TextSelection } from '@tiptap/pm/state';
import { AnimatePresence, motion } from 'framer-motion';
import { isSelectionCommentable } from '@/app/_helpers/tiptap';
import CommentBubble from '../pannels/CommentBubble';

const BlockEditor = forwardRef(({
  doc,
  editable,
  autoFocus,
  commentList,
  onAddComment,
  displayComments,
  debouncedUpdates,
}: {
  doc?: any,
  editable: boolean,
  autoFocus: boolean,
  commentList?: ReactNode,
  onAddComment?: Function,
  displayComments?: boolean,
  debouncedUpdates: Function,
}, ref) => {
  const menuContainerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  const [canComment, setCanComment] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentValue, setCommentValue] = useState<string>("");
  const [showCommentList, setShowCommentList] = useState<boolean>(false);
  const [commentBoxCoords, setCommentBoxCoords] = useState<{ top: number, left: number } | null>(null);

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

        if (from !== to && showCommentBox) {
          // Get coordinates for both ends of the selection
          const start = editor.view.coordsAtPos(from)
          const end = editor.view.coordsAtPos(to)

          // Calculate midpoint horizontally, and use the bottom Y
          const top = Math.max(start.bottom, end.bottom)
          const left = (start.left + end.right) / 2

          setCommentBoxCoords({ top, left })
        } else {
          setCommentBoxCoords(null)
        }
  
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

  // useEffect to determine if content can be commented in edit mode
  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      const inline = isSelectionCommentable(editor);
      const isInsideComment = editor.isActive('comment-highlight');

      setCanComment(inline && !isInsideComment);
    };

    editor.on('selectionUpdate', handler);

    handler();

    return () => {
      editor.off('selectionUpdate', handler);
    };
  }, [editor]);

  // useEffect close with ESC Key
  useEffect(() => {
    if (editor) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          editor.commands.focus()

          const { to } = editor?.state.selection

          editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, to)))

          setShowCommentBox(false)
          setCommentBoxCoords(null)
        }
      }
      document.addEventListener('keydown', handleEsc)

      return () => {
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }, [editor]);

  // useEffect show side comment list
  useEffect(() => {
    if (editor) {
      const handleSelectionUpdate = () => {
        const isInsideComment = editor.isActive('comment-highlight');
  
        setShowCommentList(isInsideComment);
      };
  
      editor.on('selectionUpdate', handleSelectionUpdate);
  
      handleSelectionUpdate();
    }
  }, [editor])

  // useEffect focus inside comment box when popover appears
  useEffect(() => {
    if (showCommentBox && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCommentBox]);

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
    <div className="flex gap-5 mx-auto relative">
      <div ref={menuContainerRef} className="w-full max-w-[768px] 2xl:max-w-[1024px] mx-auto relative flex flex-col bg-background md:rounded-lg z-[1] md:border md:border-divider overflow-hidden">
        {/* Fixed Top Bar */}
        {(isDraft || canEditDraft) &&
          <EditorToolbar
            editor={editor}
            canComment={canComment}
            showCommentButton={!isDraft}
            toggleCommentPopover={() => {
              const { from, to } = editor.state.selection

              if (from !== to) {
                const selectionCoords = editor.view.dom.getBoundingClientRect()
                const start = editor.view.coordsAtPos(from)
                const end = editor.view.coordsAtPos(to)
                const top = start.bottom - 60

                let left;

                const EdgeToCenterOfSelection = ((end.right + start.left) / 2)

                const isInLeftRange = start.left >= 0 && end.left <= 225;
                const isInRightRange = end.right >= (selectionCoords.width - 225) && start.right <= selectionCoords.width;

                if (isInLeftRange) {
                  left = EdgeToCenterOfSelection
                } else if (isInRightRange) {
                  left = selectionCoords.width - 450 - 80
                } else {
                  left = EdgeToCenterOfSelection - 225
                }

                setCommentBoxCoords({ top, left })
                setShowCommentBox(true)
              }
            }}
          />
        }

        {/* Scrollable Editor */}
        <div
          className={localDoc?.id ? 'pt-10 px-5 pb-5 z-10' : 'pt-10 px-5 pb-5 z-10 overflow-y-auto h-[calc(100vh-85px)]'}
        >
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

      <CommentBubble
        editor={editor}
        onComment={() => {
          // setShowCommentBox(true);
        }}
      />

      <AnimatePresence>
        {(canEditDraft && showCommentList || displayComments) &&
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full max-w-[300px] h-fit max-h-[600px] rounded-xl flex flex-col overflow-y-auto gap-2 p-1.5 sticky top-[100px] right-0 bg-transparent shadow"
          >
            {commentList}
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {showCommentBox && commentBoxCoords && (
          <>
            {/* Overlay behind comment box to detect outside clicks */}
            <div
              onClick={() => {
                setShowCommentBox(false)
                setCommentBoxCoords(null)

                editor.commands.focus()
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999, // Just under the comment box
                background: 'transparent',
              }}
            />

            {/* Animated Comment Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="border shadow flex items-center flex-grow gap-1.5 px-3 py-2 bg-white"
              style={{
                width: '100%',
                maxWidth: 450,
                borderRadius: 16,
                position: 'absolute',
                top: commentBoxCoords.top + 8,
                left: commentBoxCoords.left,
                zIndex: 1000,
              }}
            >
              <div>
                <Avatar
                  color="primary"
                  src={user?.avatar}
                  classNames={{
                    base: "w-8 h-8",
                  }}
                  name={user?.firstname?.split('')?.[0]}
                />
              </div>

              <div className="flex items-center gap-1.5 w-full">
                <Input
                  height={28}
                  isClearable
                  value={commentValue}
                  ref={inputRef}
                  onValueChange={setCommentValue}
                  placeholder={'Enter a comment'}
                />

                <Button
                  color="primary"
                  isDisabled={!commentValue}
                  onPress={() => {
                    if (onAddComment) {
                      onAddComment(editor, commentValue)

                      setCommentValue('')
                      setShowCommentBox(false)
                      setCommentBoxCoords(null)
                    }
                  }}
                >
                  {'Comment'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})

BlockEditor.displayName = 'BlockEditor'

export default BlockEditor;