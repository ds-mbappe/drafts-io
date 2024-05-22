import { lowlight } from 'lowlight';
import StarterKit from "@tiptap/starter-kit";
import Emoji from '@tiptap-pro/extension-emoji';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Placeholder from "@tiptap/extension-placeholder";
import Mathematics from '@tiptap-pro/extension-mathematics';
import CharacterCount from '@tiptap/extension-character-count';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';

import Link from "./Link";
import BoldMark from './MarkBold';
import ItalicMark from './MarkItalic';
import HeadingMark from './MarkHeading';
import AiWriter from './AiWriter/AiWriter';
import ParagraphMark from './MarkParagraph';
import UnderlineMark from './MarkUnderline';
import HorizontalRule from "./HorizontalRule";
import { TrailingNode } from './TrailingNode';
import SlashCommand from "./SlashCommand/SlashCommand";
import emojiSuggestion from './EmojiSuggestion/Suggestion';
import Table from './Table/Table';
import TableRow from './Table/Row';
import TableCell from './Table/Cell';
import TableHeader from './Table/Header';

export const ExtensionKit = () => [
  StarterKit.configure({
    history: false,
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
  TrailingNode,
  TaskItem.configure({
    nested: true,
  }),
  CharacterCount,
  HorizontalRule,
  Link.configure({
    openOnClick: false,
    linkOnPaste: true,
  }),
  AiWriter,
  ItalicMark,
  // BoldMark,
  UnderlineMark,
  // ParagraphMark,
  // HeadingMark,
  Placeholder.configure({
    placeholder: ({ node }: any) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Press '/' for commands, or enter some text.";
    },
    showOnlyCurrent: true,
    considerAnyAsEmpty: true,
    includeChildren: true,
  }),
  SlashCommand,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),
  Emoji.configure({
    enableEmoticons: true,
    // forceFallbackImages: true,
    suggestion: emojiSuggestion,
  }),
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Mathematics
]

export default ExtensionKit