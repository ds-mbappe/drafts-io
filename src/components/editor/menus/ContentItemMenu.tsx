import { GripVertical, PlusIcon } from 'lucide-react';
import { Editor } from '@tiptap/react'
import DragHandle from '@tiptap-pro/extension-drag-handle-react'
import { useData } from '@/components/editor/hooks/useData';
import useContentItemActions from '@/components/editor/hooks/useContentItemActions';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, cn } from "@nextui-org/react";

export type ContentItemMenuProps = {
  editor: Editor
}

const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
  const data = useData()
  const [menuOpen, setMenuOpen] = useState(false)
  const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos)
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

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
        <Button isIconOnly size={"sm"} variant={"light"} onClick={actions.handleAdd}>
          <PlusIcon height={16} width={16} />
        </Button>

        <Dropdown isOpen={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownTrigger>
            <Button isIconOnly size={"sm"} variant={"light"}>
              <GripVertical height={16} width={16} />
            </Button>
          </DropdownTrigger>

          <DropdownMenu variant="faded" aria-label="Dropdown menu with icons">
            <DropdownItem
              key="remove_formatting"
              description="Remove current block formatting"
              startContent={<Icon name="RemoveFormatting" />}
              onClick={actions.resetTextFormatting}
            >
              {'Clear formatting'}
            </DropdownItem>

            <DropdownItem
              key="copy_to_clipboard"
              description="Copy the content of the current block"
              startContent={<Icon name="Clipboard" />}
              onClick={actions.copyNodeToClipboard}
            >
              {'Copy to clipboard'}
            </DropdownItem>

            <DropdownItem
              key="duplicate"
              showDivider
              description="Duplicate the current block"
              startContent={<Icon name="Copy" />}
              onClick={actions.duplicateNode}
            >
              {'Duplicate'}
            </DropdownItem>

            <DropdownItem
              key="delete"
              color="danger"
              className="text-danger"
              description="Delete the current block"
              startContent={<Icon name="Trash2" className={cn(iconClasses, "text-danger")}/>}
              onClick={actions.deleteNode}
            >
              {'Delete'}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </DragHandle>
  )
}

ContentItemMenu.displayName = "ContentItemMenu"

export default ContentItemMenu