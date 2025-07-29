import { MarkType } from "@tiptap/pm/model"
import { ExtendedRegExpMatchArray, Mark, Node, PasteRule, PasteRuleFinder, markInputRule, callOrReturn, mergeAttributes } from "@tiptap/react"
import Heading from "./Heading"


const inputRegex = /<p>(.*?)<\/p>/
// const inputRegex = /(?:^|\s)(<p>(?!\s+~~)((?:[^]+))(?!\s+<\/p>))$/

export interface ParagraphMarkOptions {
  HTMLAttributes: Record<string, any>,
}

export function paragraphPasteInputRule(config: {
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
    handler: ({ state, range, match, pasteEvent, chain }) => {
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
        state.tr.delete(range.from, range.to)

        chain().insertContentAt($start.pos - 1, {
          type: "paragraph",
          content: [
            {
              text: captureGroup,
              type: "text"
            }
          ]
        })

        // if (textEnd < range.to) {
        //   tr.delete(textEnd, range.to)
        // }

        // if (textStart > range.from) {
        //   tr.delete(range.from + startSpaces, textStart)
        // }

        // markEnd = range.from + startSpaces + captureGroup.length

        // tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}))
        // tr.removeStoredMark(config.type)
      }
    },
  })
}

export const ParagraphMark = Mark.create<ParagraphMarkOptions>({
  name: 'paragraphMark',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      })
    ]
  },
  
  // addPasteRules() {
  //   return [
  //     paragraphPasteInputRule({
  //       find: inputRegex,
  //       type: this.type,
  //     })
  //   ]
  // }
})

export default ParagraphMark