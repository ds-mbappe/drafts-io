import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentHighlight: {
      addComment: (commentId: string) => ReturnType,
      removeComment: () => ReturnType,
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
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'tiptap-comment' }), 0]
  },
});

export default CommentHighlight;