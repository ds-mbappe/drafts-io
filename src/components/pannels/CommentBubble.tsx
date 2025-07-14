import React, { memo, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelectionBubble } from '@/hooks/useSelectionBubble';
import { Avatar, Button, Input } from '@heroui/react';
import { BaseUser } from '@/lib/types';
import { errorToast } from '@/actions/showToast';
import { createComment } from '@/actions/comment';
import { useComments } from '@/hooks/useComments';
import Icon from '../ui/Icon';

const CommentBubble = ({
  user,
  editor,
  documentId,
}: {
  user: BaseUser,
  editor: Editor,
  documentId: string,
}) => {
  const MemoButton = memo(Button);
  
  const coords = useSelectionBubble(editor);

  const inputRef = useRef<HTMLInputElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  const { mutate: mutateComments } = useComments(documentId);

  const [commentValue, setCommentValue] = useState<string>("");
  const [isCommenting, setIsCommenting] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);

  const onComment = async () => {
    const { state } = editor;
    const { from, to } = state.selection;

    setCommentLoading(true)

    try {
      if (from !== to) {
        const { comment } = await createComment({
          documentId,
          userId: user.id,
          text: commentValue,
          from: from,
          to: to,
        });
        
        if (comment) {  
          editor.commands.addComment(comment.id)
    
          await mutateComments();
        }
      }
    } catch (error) {
      console.log(error);
      errorToast('Error adding comment.')
    } finally {
      setCommentValue('')
      setIsCommenting(false)
      setCommentLoading(false)
    }
  }

  // useEffect close the portal and reset when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (portalRef.current && !portalRef.current.contains(event.target as Node)) {
        setIsCommenting(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect reset isCommenting state on close
  useEffect(() => {
    if (!editor) return;

    const cancel = () => setIsCommenting(false);

    // document.addEventListener('mousedown', cancel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cancel();
    });

    return () => {
      // document.removeEventListener('mousedown', cancel);
      document.removeEventListener('keydown', cancel);
    };
  }, [editor]);

  // useEffect focus inside comment box when popover appears
  useEffect(() => {
    if (coords && inputRef.current) {
      inputRef.current.focus();
    }
  }, [coords]);

  if (!coords) return null;

  return createPortal(
    <AnimatePresence>
      {coords && (
        <motion.div
          ref={portalRef}
          key="comment-bubble"
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="bg-background border border-divider shadow rounded-lg flex items-center gap-1.5 px-3 py-1.5"
          style={{
            position: 'absolute',
            top: coords.top + window.scrollY - 48,
            left: coords.left + window.scrollX - 40,
            zIndex: 9999,
          }}
        >
          {isCommenting ? (
            <>
              <div>
                <Avatar
                  color="primary"
                  src={user?.avatar}
                  classNames={{ base: "w-8 h-8" }}
                  name={user?.firstname?.[0]}
                />
              </div>
              <div className="flex items-center gap-1.5 w-full">
                <Input
                  isClearable
                  height={28}
                  ref={inputRef}
                  value={commentValue}
                  onValueChange={setCommentValue}
                  placeholder="Enter a comment"
                />

                <MemoButton
                  size="sm"
                  radius="full"
                  isIconOnly
                  variant="solid"
                  color="primary"
                  isLoading={commentLoading}
                  isDisabled={!commentValue}
                  onPress={onComment}
                >
                  <Icon name="ArrowUp" />
                </MemoButton>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsCommenting(true)}
              className="text-sm font-medium text-foreground hover:text-default-500 transition"
            >
              💬 Add Comment
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default CommentBubble