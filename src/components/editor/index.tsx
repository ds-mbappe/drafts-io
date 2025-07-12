"use client";

import 'katex/dist/katex.min.css';
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { getLocalStorageWithExpiry, setLocalStorageWithExpiry } from "@/app/_helpers/storage";
import { EditorContent } from "@tiptap/react";
import ImageBlockMenu from "./extensions/ImageBlock/components/ImageBlockMenu";
import ContentItemMenu from "./menus/ContentItemMenu";
import EditorToolbar from "./toolbars/EditorToolbar";
import { Avatar, AvatarIcon, Button, Input } from '@heroui/react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { TextSelection } from '@tiptap/pm/state';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../ui/Icon';
import { useTextMenuCommands } from './hooks/useTextMenuCommands';

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
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  const [value, setValue] = useState<string>("");
  const [showCommentBox, setShowCommentBox] = useState(false);
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

  const canEditDraft = useCallback(() => {
    return localDoc?.authorId === userID && editable;
  }, [localDoc?.authorId, editable, userID]);

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

  useEffect(() => {
    if (editor) {
      const handleSelectionUpdate = () => {
        const isInsideComment = editor.isActive('comment-highlight');
  
        setShowCommentBox(isInsideComment);
      };
  
      editor.on('selectionUpdate', handleSelectionUpdate);
  
      handleSelectionUpdate();
    }
  }, [editor])

  useEffect(() => {
    if (showCommentBox && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCommentBox]);

  useEffect(() => {
    if (doc?.id) {
      setLocalDoc(doc);
    }
  }, [doc]);

  if (!editor) return

  return (
    <div className="flex gap-5 mx-auto relative">
      <div ref={menuContainerRef} className="w-full max-w-[768px] 2xl:max-w-[1024px] mx-auto relative flex flex-col bg-background md:rounded-lg z-[1] md:border md:border-divider overflow-hidden">
        {/* Fixed Top Bar */}
        {canEditDraft() &&
          <EditorToolbar
            editor={editor}
            toggleCommentPopover={() => {
              const { from, to } = editor.state.selection

              if (from !== to) {
                const selectionCoords = editor.view.dom.getBoundingClientRect()
                const start = editor.view.coordsAtPos(from)
                const end = editor.view.coordsAtPos(to)

                // console.log(selectionCoords)
                // console.log(start)
                // console.log(end)

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
          // className="pt-10 px-5 pb-5 z-10 overflow-y-auto h-[calc(100vh-85px)]"
          className={localDoc?.id ? 'pt-10 px-5 pb-5 z-10' : 'pt-10 px-5 pb-5 z-10 overflow-y-auto h-[calc(100vh-85px)]'}
        >
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

      <div className="w-full max-w-[250px] flex-1 h-[600px] p-1 flex flex-col rounded-xl shadow overflow-y-auto sticky top-[100px] right-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus varius sem ac velit gravida, in pulvinar augue aliquam. Suspendisse molestie felis ligula. Aliquam a luctus orci. Aliquam eros magna, venenatis non purus eu, scelerisque auctor quam. Aenean eu nunc erat. Aenean fringilla metus sed massa rutrum fringilla. Aliquam id finibus neque, in blandit diam. Nulla eget augue consectetur, accumsan lectus quis, ullamcorper nunc.Hello
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus varius sem ac velit gravida, in pulvinar augue aliquam. Suspendisse molestie felis ligula. Aliquam a luctus orci. Aliquam eros magna, venenatis non purus eu, scelerisque auctor quam. Aenean eu nunc erat. Aenean fringilla metus sed massa rutrum fringilla. Aliquam id finibus neque, in blandit diam. Nulla eget augue consectetur, accumsan lectus quis, ullamcorper nunc.Hello
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus varius sem ac velit gravida, in pulvinar augue aliquam. Suspendisse molestie felis ligula. Aliquam a luctus orci. Aliquam eros magna, venenatis non purus eu, scelerisque auctor quam. Aenean eu nunc erat. Aenean fringilla metus sed massa rutrum fringilla. Aliquam id finibus neque, in blandit diam. Nulla eget augue consectetur, accumsan lectus quis, ullamcorper nunc.Hello
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus varius sem ac velit gravida, in pulvinar augue aliquam. Suspendisse molestie felis ligula. Aliquam a luctus orci. Aliquam eros magna, venenatis non purus eu, scelerisque auctor quam. Aenean eu nunc erat. Aenean fringilla metus sed massa rutrum fringilla. Aliquam id finibus neque, in blandit diam. Nulla eget augue consectetur, accumsan lectus quis, ullamcorper nunc.Hello
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus varius sem ac velit gravida, in pulvinar augue aliquam. Suspendisse molestie felis ligula. Aliquam a luctus orci. Aliquam eros magna, venenatis non purus eu, scelerisque auctor quam. Aenean eu nunc erat. Aenean fringilla metus sed massa rutrum fringilla. Aliquam id finibus neque, in blandit diam. Nulla eget augue consectetur, accumsan lectus quis, ullamcorper nunc.Hello
      </div>

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
                  classNames={{
                    base: "w-6 h-6 bg-gradient-to-br from-[FFB457_1] to-[FF705B_1]",
                    icon: "text-black/80",
                  }}
                  icon={<AvatarIcon />}
                />
              </div>

              <div className="flex items-center gap-1.5 w-full">
                <Input
                  height={28}
                  isClearable
                  value={value}
                  ref={inputRef}
                  onValueChange={setValue}
                  placeholder={'Enter a comment'}
                />

                <Button
                  color="primary"
                  isDisabled={!value}
                  onPress={() => {
                    if (onAddComment) {
                      onAddComment(editor)

                      setValue('')
                    }
                  }}
                >
                  Comment
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}