import { GripVertical, PlusIcon } from 'lucide-react';
import { Editor } from '@tiptap/react'
import DragHandle from '@tiptap-pro/extension-drag-handle-react'

import { useData } from '@/components/editor/hooks/useData';
import useContentItemActions from '@/components/editor/hooks/useContentItemActions';
import { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover'
import { Toolbar } from '@/components/ui/Toolbar';
import { Surface } from '@/components/ui/Surface';
import Icon from '@/components/ui/Icon';

export type ContentItemMenuProps = {
  editor: Editor
}

const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
  const data = useData()
  const [menuOpen, setMenuOpen] = useState(false)
  const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos)

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta('lockDragHandle', true)
    } else {
      editor.commands.setMeta('lockDragHandle', false)
    }
  }, [editor, menuOpen])

  return (
    <DragHandle
      pluginKey="ContentItemMenu"
      editor={editor}
      onNodeChange={data.handleNodeChange}
      tippyOptions={{
        offset: [-2, 12],
        zIndex: 99,
      }}
    >
      <div className="flex items-center gap-0.5">
        <div
          className="hover:bg-muted p-1 rounded cursor-pointer"
          onClick={actions.handleAdd}
        >
          <PlusIcon height={20} width={20} />
        </div>

        <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Popover.Trigger asChild>
            <div className="hover:bg-muted p-1 rounded cursor-pointer">
              <GripVertical height={20} width={20} />
            </div>
          </Popover.Trigger>
          
          <Popover.Content side="bottom" align="start" sideOffset={8}>
            <Surface className="p-2 flex flex-col min-w-[16rem]">
              <Popover.Close>
                <div
                  onClick={actions.resetTextFormatting}
                  className="flex items-center gap-2 p-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 text-left bg-transparent w-full rounded"
                >
                  <Icon name="RemoveFormatting" />
                  Clear formatting
                </div>
              </Popover.Close>

              <Popover.Close>
                <div
                  onClick={actions.copyNodeToClipboard}
                  className="flex items-center gap-2 p-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 text-left bg-transparent w-full rounded"
                >
                  <Icon name="Clipboard" />
                  Copy to clipboard
                </div>
              </Popover.Close>

              <Popover.Close>
                <div
                  onClick={actions.duplicateNode}
                  className="flex items-center gap-2 p-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 text-left bg-transparent w-full rounded"
                >
                  <Icon name="Copy" />
                  Duplicate
                </div>
              </Popover.Close>

              <Toolbar.Divider horizontal />

              <Popover.Close>
                <div
                  onClick={actions.deleteNode}
                  className="flex items-center gap-2 p-1.5 text-sm font-medium text-left bg-transparent w-full rounded text-red-500 hover:bg-red-500 bg-opacity-10 hover:bg-opacity-20 hover:text-red-500"
                >
                  <Icon name="Trash2" />
                  Delete
                </div>
              </Popover.Close>
            </Surface>
          </Popover.Content>
        </Popover.Root>
      </div>
    </DragHandle>
  )
}

ContentItemMenu.displayName = "ContentItemMenu"

export default ContentItemMenu