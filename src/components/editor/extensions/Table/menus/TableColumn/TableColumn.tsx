import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react'
import React, { useCallback } from 'react'
import { isColumnGripSelected } from './utils'
import { MenuProps, ShouldShowProps } from '@/components/editor/menus/types'
import { cn, Listbox, ListboxItem } from "@heroui/react"
import Icon from '@/components/ui/Icon'

export const TableColumnMenu = React.memo(({ editor, appendTo }: MenuProps): JSX.Element => {
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const shouldShow = useCallback(
    ({ view, state, from }: ShouldShowProps) => {
      if (!state) {
        return false
      }

      return isColumnGripSelected({ editor, view, state, from: from || 0 })
    },
    [editor],
  )

  const onAddColumnBefore = useCallback(() => {
    editor.chain().focus().addColumnBefore().run()
  }, [editor])

  const onAddColumnAfter = useCallback(() => {
    editor.chain().focus().addColumnAfter().run()
  }, [editor])

  const onDeleteColumn = useCallback(() => {
    editor.chain().focus().deleteColumn().run()
  }, [editor])

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="tableColumnMenu"
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
      <div className="w-full z-[9999] max-w-[260px] border-small p-1 rounded-xl border-default-200 bg-content1 dark:border-default-100">
        <Listbox variant="bordered" aria-label="Actions-table-column-menu" className="bg-content1">
          <ListboxItem
            key="add_before"
            description="Add a column before the current block"
            startContent={<Icon name="ArrowLeftToLine" />}
            onClick={onAddColumnBefore}
          >
            {'Add column before'}
          </ListboxItem>

          <ListboxItem
            key="add_after"
            description="Add a column after the current block"
            startContent={<Icon name="ArrowDownToLine" />}
            onClick={onAddColumnAfter}
          >
            {'Add column after'}
          </ListboxItem>

          <ListboxItem
            key="delete_row"
            color="danger"
            className="text-danger"
            description="Delete the current column"
            startContent={<Icon name="Trash" className={cn(iconClasses, "text-danger")}/>}
            onClick={onDeleteColumn}
          >
            {"Delete row"}
          </ListboxItem>
        </Listbox>
      </div>
    </BaseBubbleMenu>
  )
})

TableColumnMenu.displayName = 'TableColumnMenu'

export default TableColumnMenu