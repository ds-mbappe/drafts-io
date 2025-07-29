import { MarkType } from '@tiptap/pm/model';
import { mergeAttributes, nodeInputRule, Node, textblockTypeInputRule } from '@tiptap/core'

const inputRegex = /<h[1-6]>(.*?)<\/h[1-6]>/g
const test = /<h[1-6]>()<\/h[1-6]>/g

export type Level = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingMarkOptions {
  levels: Level[],
  HTMLAttributes: Record<string, any>,
}

export const HeadingMark = Node.create<HeadingMarkOptions>({
  name: 'headingMark',

  content: 'inline*',

  group: 'block',

  defining: true,

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {},
    }
  },
  
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
    }
  },

  parseHTML() {
    return this.options.levels
      .map((level: Level) => ({
        tag: `h${level}`,
        attrs: { level },
      }))
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level)
    const level = hasLevel
      ? node.attrs.level
      : this.options.levels[0]

    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{1,${level}})\\s$`),
        type: this.type,
        getAttributes: {
          level,
        },
      })
    })
  },
  
  // addPasteRules() {
  //   return this.options.levels.map(level => {
  //     return headingPasteInputRule({
  //       find: inputRegex,
  //       type: this.type,
  //       getAttributes: {
  //         level: level,
  //       },
  //     })
  //   })
  // }
})

export default HeadingMark