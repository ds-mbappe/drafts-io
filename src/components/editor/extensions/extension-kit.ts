import { lowlight } from 'lowlight';
import StarterKit from "@tiptap/starter-kit";
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from '@tiptap/extension-character-count';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';

import Link from "./Link";
import Document from "./document";
import HorizontalRule from "./HorizontalRule";
import SlashCommand from "./SlashCommand/SlashCommand";

export const ExtensionKit = () => [
  Document,
  StarterKit.configure({
    document: false,
    bulletList: {
      HTMLAttributes: {
        class: "list-disc list-outside leading-3",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal list-outside leading-3",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "leading-normal",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-gray-300 pl-4",
      },
    },
    codeBlock: false,
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
    horizontalRule: false,
  }),
  Typography,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  CharacterCount,
  HorizontalRule,
  Link.configure({
    openOnClick: false,
    linkOnPaste: true,
  }),
  Placeholder.configure({
    placeholder: ({ node }: any) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Press '/' for commands, or enter some text.";
    },
    includeChildren: true,
  }),
  SlashCommand,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),
]

export default ExtensionKit