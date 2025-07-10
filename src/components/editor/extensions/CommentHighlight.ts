import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentHighlight: {
      addComment: (commentId: string) => ReturnType,
      removeComment: () => ReturnType,
      replaceCommentId: (oldId: string, newId: string) => ReturnType,
    }
  }
}

export const CommentHighlight = Mark.create({
  name: 'comment-highlight',

  inline: true,
  group: 'inline',
  excludes: '',

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) return {}

          return { 'data-comment-id': attributes.commentId }
        },
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleMark(this.name),
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span.tiptap-comment',
        getAttrs: element => ({
          commentId: element.getAttribute('data-comment-id'),
        }),
      },
    ]
  },

  addCommands() {
    return {
      addComment: (commentId) => ({ commands }) => {
        return commands.setMark(this.name, { commentId })
      },
      removeComment: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
      replaceCommentId: (oldId, newId) => ({ state, view }) => {
          const { tr, doc } = state

          doc.descendants((node, pos) => {
            if (node.isText) {
              node.marks.forEach(mark => {
                if (mark.type.name === 'comment-highlight' && mark.attrs.commentId === oldId && node.text) {
                  const textLength = node.text?.length

                  tr.removeMark(pos, pos + textLength, mark.type)
                  tr.addMark(
                    pos,
                    pos + textLength,
                    mark.type.create({ commentId: newId }),
                  )
                }
              })
            }

            return true
          })

          view.dispatch(tr);

        return true
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'tiptap-comment' }), 0]
  },
});

export default CommentHighlight;