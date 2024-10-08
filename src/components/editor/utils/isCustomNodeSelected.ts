import { Editor } from '@tiptap/react';
import { HorizontalRule } from '../extensions/HorizontalRule';
import { Link } from '../extensions/Link';
import { CodeBlock } from '@tiptap/extension-code-block';
import AiWriter from '../extensions/AiWriter/AiWriter';
import ImageBlock from '../extensions/ImageBlock/ImageBlock';
import ImageUpload from '../extensions/ImageUpload/ImageUpload';

export const isTableGripSelected = (node: HTMLElement) => {
  let container = node

  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement!
  }

  const gripColumn = container && container.querySelector && container.querySelector('a.grip-column.selected')
  const gripRow = container && container.querySelector && container.querySelector('a.grip-row.selected')

  if (gripColumn || gripRow) {
    return true
  }

  return false
}

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
  const customNodes = [
    HorizontalRule.name,
    CodeBlock.name,
    Link.name,
    AiWriter.name,
    ImageBlock.name,
    ImageUpload.name,
  ]

  return customNodes.some(type => editor.isActive(type)) || isTableGripSelected(node)
}

export default isCustomNodeSelected