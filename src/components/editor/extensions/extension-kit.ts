import { lowlight } from 'lowlight';
import Code from '@tiptap/extension-code'
import StarterKit from "@tiptap/starter-kit";
import Emoji from '@tiptap/extension-emoji';
import { Color } from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from "@tiptap/extension-placeholder";
import Superscript from '@tiptap/extension-superscript';
import Mathematics from '@tiptap/extension-mathematics';
import CharacterCount from '@tiptap/extension-character-count';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';

import Link from "./Link";
import Image from './Image/Image';
import Table from './Table/Table';
import FontSize from './FontSize';
import TableRow from './Table/Row';
import Selection from './Selection';
import TableCell from './Table/Cell';
import TableHeader from './Table/Header';
import AiWriter from './AiWriter/AiWriter';
import UnderlineMark from './MarkUnderline';
import BoldMark from './MarkBold';
import ItalicMark from './MarkItalic';
import HeadingMark from './MarkHeading';
import ParagraphMark from './MarkParagraph';
import HorizontalRule from "./HorizontalRule";
import { TrailingNode } from './TrailingNode';
import ImageBlock from './ImageBlock/ImageBlock';
import ImageUpload from './ImageUpload/ImageUpload';
import SlashCommand from "./SlashCommand/SlashCommand";
import emojiSuggestion from './EmojiSuggestion/Suggestion';

export const ExtensionKit = () => [
  StarterKit.configure({
    code: false,
    history: false,
    codeBlock: false,
    horizontalRule: false,
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
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
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
  Image,
  ImageBlock,
  ImageUpload,
  AiWriter,
  // ItalicMark,
  // BoldMark,
  // UnderlineMark,
  // ParagraphMark,
  // HeadingMark,
  Placeholder.configure({
    placeholder: ({ node }: any) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Press '/' for commands";
    },
    showOnlyCurrent: true,
    considerAnyAsEmpty: true,
    includeChildren: true,
  }),
  Selection,
  SlashCommand,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),
  Emoji.configure({
    enableEmoticons: true,
    suggestion: emojiSuggestion,
  }),
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TextStyle,
  Mathematics,
  Underline,
  Subscript,
  Superscript,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Color.configure({
    types: ['textStyle'],
  }),
  Highlight.configure({
    multicolor: true,
  }),
  FontFamily.configure({
    types: ['textStyle', 'code'],
  }),
  FontSize,
  Code,
]

export default ExtensionKit