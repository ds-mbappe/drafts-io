import StarterKit from "@tiptap/starter-kit";
import CharacterCount from '@tiptap/extension-character-count';
import Document from './document';
import HorizontalRule from "./HorizontalRule";
import Link from "./Link";

export const ExtensionKit = () => [
  Document,
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    history: false,
    codeBlock: false,
  }),
  CharacterCount,
  HorizontalRule,
  Link.configure({
    openOnClick: false,
    linkOnPaste: true,
  })
]

export default ExtensionKit