import { Document as TiptapDocument } from '@tiptap/extension-document'

export const Document = TiptapDocument.extend({
  name: "doc",
  topNode: true,
  content: '(block)+',
})

export default Document