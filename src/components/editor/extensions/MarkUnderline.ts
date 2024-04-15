import { MarkType } from "@tiptap/pm/model"
import { ExtendedRegExpMatchArray, Mark, PasteRule, PasteRuleFinder, callOrReturn, mergeAttributes } from "@tiptap/react"

const inputRegex = /<u>(.*?)<\/u>/g

export interface UnderlineMarkOptions {
  HTMLAttributes: Record<string, any>,
}

export function UnderlinePasteInputRule(config: {
  find: PasteRuleFinder
  type: MarkType
  getAttributes?:
  | Record<string, any>
  | ((match: ExtendedRegExpMatchArray, event: ClipboardEvent) => Record<string, any>)
  | false
  | null
}) {
  return new PasteRule({
    find: config.find,
    handler: ({ state, range, match, pasteEvent }) => {
      const $start = state.doc.resolve(range.from)
      const $end = state.doc.resolve(range.to)
      const attributes = callOrReturn(config.getAttributes, undefined, match, pasteEvent)

      if (attributes === false || attributes === null) {
        return null
      }

      const { tr } = state
      const captureGroup = match[match.length - 1]
      const fullMatch = match[0]
      let markEnd = range.to

      if (captureGroup) {
        const startSpaces = fullMatch.search(/\S/)
        const textStart = range.from + fullMatch.indexOf(captureGroup)
        const textEnd = textStart + captureGroup.length

        if (textEnd < range.to) {
          tr.delete(textEnd, range.to)
        }

        if (textStart > range.from) {
          tr.delete(range.from + startSpaces, textStart)
        }

        markEnd = range.from + startSpaces + captureGroup.length

        tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}))
        tr.removeStoredMark(config.type)
      }
    },
  })
}

export const UnderlineMark = Mark.create<UnderlineMarkOptions>({
  name: 'underlineMark',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      { 
        tag: 'u',
      },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: style => ((style as string).includes('underline') ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['u', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
  
  addPasteRules() {
    return [
      UnderlinePasteInputRule({
        find: inputRegex,
        type: this.type,
      })
    ]
  }
})

export default UnderlineMark