import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react'
import React, { useCallback } from 'react'
import { isRowGripSelected } from './utils'
import { MenuProps, ShouldShowProps } from '@/components/editor/menus/types'
import { cn, Listbox, ListboxItem } from "@heroui/react"
import Icon from '@/components/ui/Icon'

export const TableRowMenu = React.memo(({ editor, appendTo }: MenuProps): JSX.Element => {
  const iconClasses = "text-xl text-default-500 pointer-events-none shrink-0";

  const shouldShow = useCallback(
    ({ view, state, from }: ShouldShowProps) => {
      if (!state || !from) {
        return false
      }

      return isRowGripSelected({ editor, view, state, from })
    },
    [editor],
  )

  const onAddRowBefore = useCallback(() => {
    editor.chain().focus().addRowBefore().run()
  }, [editor])

  const onAddRowAfter = useCallback(() => {
    editor.chain().focus().addRowAfter().run()
  }, [editor])

  const onDeleteRow = useCallback(() => {
    editor.chain().focus().deleteRow().run()
  }, [editor])

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="tableRowMenu"
      updateDelay={0}
      tippyOptions={{
        appendTo: () => {
          return appendTo?.current
        },
        placement: 'auto',
        offset: [0, 15],
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
      }}
      shouldShow={shouldShow}
    >
      <div className="w-full max-w-[260px] border-small p-1 rounded-xl border-default-200 bg-content1 dark:border-default-100">
        <Listbox variant="bordered" aria-label="Actions-table-row-menu" className="bg-content1">
          <ListboxItem
            key="add_before"
            description="Add a block before the current block"
            startContent={<Icon name="ArrowUpToLine" />}
            onClick={onAddRowBefore}
          >
            {'Add row before'}
          </ListboxItem>

          <ListboxItem
            key="add_after"
            description="Add a block after the current block"
            startContent={<Icon name="ArrowDownToLine" />}
            onClick={onAddRowAfter}
          >
            {'Add row after'}
          </ListboxItem>

          <ListboxItem
            key="delete_row"
            color="danger"
            className="text-danger"
            description="Delete the current row"
            startContent={<Icon name="Trash2" className={cn(iconClasses, "text-danger")}/>}
            onClick={onDeleteRow}
          >
            {"Delete row"}
          </ListboxItem>
        </Listbox>
      </div>
    </BaseBubbleMenu>
  )
})

TableRowMenu.displayName = 'TableRowMenu'

export default TableRowMenu