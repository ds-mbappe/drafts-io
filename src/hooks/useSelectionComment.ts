import { isSelectionCommentable } from '@/app/_helpers/tiptap';
import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

export function useSelectionBubble(editor: Editor) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!editor) return;

    let timeout: number;

    const update = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        const { from, to } = editor.state.selection;

        if (from === to) {
          setCoords(null);
          return;
        }

        if (isSelectionCommentable(editor)) {
          const start = editor.view.coordsAtPos(from);
          const end = editor.view.coordsAtPos(to);
  
          const top = Math.min(start.top, end.top);
          const left = (start.left + end.right) / 2;
  
          setCoords({ top, left });
        }
      }, 250);
    };

    editor.on('selectionUpdate', update);

    update();

    const cancel = () => setCoords(null);

    // document.addEventListener('mousedown', cancel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cancel();
    });

    return () => {
      editor.off('selectionUpdate', update);

      // document.removeEventListener('mousedown', cancel);
      document.removeEventListener('keydown', cancel);

      clearTimeout(timeout);
    };
  }, [editor]);

  return coords;
}