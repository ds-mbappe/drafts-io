import { MarkType } from '@tiptap/pm/model';
import Heading from '@tiptap/extension-heading';
import { ExtendedRegExpMatchArray, Mark, PasteRule, PasteRuleFinder, callOrReturn, mergeAttributes } from '@tiptap/react';

const inputRegex = /<h[1-6]>(.*?)<\/h[1-6]>/g

export type Level = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingMarkOptions {
  levels: Level[],
  HTMLAttributes: Record<string, any>,
}

export function headingPasteInputRule(config: {
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

        // if (textEnd < range.to) {
        //   tr.delete(textEnd, range.to)
        // }

        // if (textStart > range.from) {
        //   tr.delete(range.from + startSpaces, textStart)
        // }

        // markEnd = range.from + startSpaces + captureGroup.length

        // tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}))
        // tr.removeStoredMark(config.type)

        chain().insertContentAt($start.pos, {
          type: "heading",
          attrs: {
            level: parseInt(fullMatch?.slice(2, 3))
          },
          content: [
            {
              text: captureGroup,
              type: "text"
            }
          ]
        })
        // state.tr.setBlockType($start.pos + 4, $start.pos + 4, Heading.type, attributes)
      }
    },
  })
}

export const HeadingMark = Mark.create<HeadingMarkOptions>({
  name: 'headingMark',

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
  
  addPasteRules() {
    return this.options.levels.map(level => {
      return headingPasteInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: {
          level: level,
        },
      })
    })
  }
})

export default HeadingMark