import { Group } from './types'

export const GROUPS: Group[] = [
  {
    name: 'ai',
    title: 'AI',
    commands: [
      {
        name: 'aiWriter',
        label: 'AI Writer',
        iconName: 'Sparkles',
        description: 'Ask something to the AI.',
        shouldBeHidden: editor => editor.isActive('columns'),
        action: editor => editor.chain().focus().setAiWriter().run(),
      },
      // {
      //   name: 'aiImage',
      //   label: 'AI Image',
      //   iconName: 'Sparkles',
      //   description: 'Generate an image from text',
      //   shouldBeHidden: editor => editor.isActive('columns'),
      //   action: editor => editor.chain().focus().setAiImage().run(),
      // },
    ],
  },
  {
    name: 'format',
    title: 'Format',
    commands: [
      {
        name: 'heading1',
        label: 'Heading 1',
        iconName: 'Heading1',
        description: 'H1 heading',
        aliases: ['h1'],
        action: editor => {
          editor.chain().focus().setHeading({ level: 1 }).run()
        },
      },
      {
        name: 'heading2',
        label: 'Heading 2',
        iconName: 'Heading2',
        description: 'H2 heading',
        aliases: ['h2'],
        action: editor => {
          editor.chain().focus().setHeading({ level: 2 }).run()
        },
      },
      {
        name: 'heading3',
        label: 'Heading 3',
        iconName: 'Heading3',
        description: 'H3 heading',
        aliases: ['h3'],
        action: editor => {
          editor.chain().focus().setHeading({ level: 3 }).run()
        },
      },
      {
        name: 'bulletList',
        label: 'Bullet List',
        iconName: 'List',
        description: 'Create a simple Bullet list.',
        aliases: ['ul'],
        action: editor => {
          editor.chain().focus().toggleBulletList().run()
        },
      },
      {
        name: 'numberedList',
        label: 'Numbered List',
        iconName: 'ListOrdered',
        description: 'Create an ordered list.',
        aliases: ['ol'],
        action: editor => {
          editor.chain().focus().toggleOrderedList().run()
        },
      },
      {
        name: 'taskList',
        label: 'Task List',
        iconName: 'ListTodo',
        description: 'Create a checklist.',
        aliases: ['todo'],
        action: editor => {
          editor.chain().focus().toggleTaskList().run()
        },
      },
      {
        name: 'blockquote',
        label: 'Blockquote',
        iconName: 'Quote',
        description: 'Create a quote.',
        action: editor => {
          editor.chain().focus().setBlockquote().run()
        },
      },
      {
        name: 'codeBlock',
        label: 'Code Block',
        iconName: 'Code',
        description: 'Add some Code, with syntax highlighting.',
        shouldBeHidden: editor => editor.isActive('columns'),
        action: editor => {
          editor.chain().focus().setCodeBlock().run()
        },
      },
    ],
  },
  {
    name: 'insert',
    title: 'Insert',
    commands: [
      // {
      //   name: 'table',
      //   label: 'Table',
      //   iconName: 'Table',
      //   description: 'Insert a table',
      //   shouldBeHidden: editor => editor.isActive('columns'),
      //   action: editor => {
      //     editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()
      //   },
      // },
      // {
      //   name: 'image',
      //   label: 'Image',
      //   iconName: 'Image',
      //   description: 'Insert an image',
      //   aliases: ['img'],
      //   action: editor => {
      //     editor.chain().focus().setImageUpload().run()
      //   },
      // },
      {
        name: 'horizontalRule',
        label: 'Horizontal Rule',
        iconName: 'Minus',
        description: 'Crate a horizontal divider.',
        aliases: ['hr'],
        action: editor => {
          editor.chain().focus().setHorizontalRule().run()
        },
      },
    ],
  },
]

export default GROUPS