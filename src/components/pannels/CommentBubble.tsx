import React from 'react';
import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelectionBubble } from '@/hooks/useSelectionComment';

const CommentBubble = ({
  editor,
  onComment
}: {
  editor: Editor,
  onComment: () => void
}) => {
  const coords = useSelectionBubble(editor);

  if (!coords) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="comment-bubble"
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: coords.top + window.scrollY - 48,
          left: coords.left + window.scrollX,
          zIndex: 9999,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: 6,
          padding: '6px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <button
          onClick={onComment}
          className="text-sm font-medium text-gray-700 hover:text-black transition"
        >
          💬 Add Comment
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default CommentBubble