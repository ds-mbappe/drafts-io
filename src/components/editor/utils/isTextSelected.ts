import { isTextSelection } from '@tiptap/core'
import { NodeSelection } from '@tiptap/pm/state'
import { Editor } from '@tiptap/react'

export const isTextSelected = ({ editor }: { editor: Editor }) => {
  const {
    state: {
      doc,
      selection,
      selection: { empty, from, to },
    },
  } = editor

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection)
  const isSameNodeSelected = selection instanceof NodeSelection;

  if (empty || isEmptyTextBlock || !editor.isEditable || isSameNodeSelected) {
    return false
  }

  return true
}

export default isTextSelected