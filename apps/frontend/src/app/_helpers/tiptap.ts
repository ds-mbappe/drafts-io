import { Editor } from "@tiptap/react";

export const isSelectionCommentable = (editor: Editor) => {
  const { state } = editor;
  const { selection } = state;
  const { from, to } = selection;
  const ALLOWED_TO_COMMENT_NODES = [
    'paragraph',
    'heading'
  ]

  if (from === to) {
    // Collapsed selection (just a cursor)
    // const $pos = state.selection.$from;
    // return $pos.parent.inlineContent;
    return false;
  }

  if (!ALLOWED_TO_COMMENT_NODES.includes(selection.$anchor.parent.type.name)) {
    return false;
  }
  return true
}