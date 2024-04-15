import { MarkType, NodeType } from '@tiptap/pm/model';
import { ExtendedRegExpMatchArray, InputRule, InputRuleFinder, Mark, PasteRule, PasteRuleFinder, callOrReturn, getMarksBetween } from '@tiptap/react';
import TipTapHeading from '@tiptap/extension-heading';

const inputRegex = /<h1>(.*?)<\/h1>/g

export function textblockTypeInputRule(config: {
  find: InputRuleFinder
  type: NodeType
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
}) {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match, can, chain, commands }) => {
      const $start = state.doc.resolve(range.from)
      const $end = state.doc.resolve(range.to)
      const attributes = callOrReturn(config.getAttributes, undefined, match) || {}

      const text = state.doc.textBetween($start.pos + 4, $end.pos - 4)
      state.tr.delete(range.from, range.to)

      chain().insertContentAt($start.pos, {
        type: "paragraph",
        attrs: ["level"],
        content: [
          {
            text: text,
            type: "text"
          }
        ]
      })
      state.tr.setBlockType($start.pos + 4, $start.pos + 4, config.type, attributes)
    },
  })
}

export const Heading = TipTapHeading.extend({
  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: {
          level,
        },
      })
    })
  },
})

export default Heading