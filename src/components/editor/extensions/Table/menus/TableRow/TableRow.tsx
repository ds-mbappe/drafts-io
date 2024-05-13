import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react'
import React, { useCallback } from 'react'
import { isRowGripSelected } from './utils'
import { MenuProps, ShouldShowProps } from '@/components/editor/menus/types'
import { ArrowDownToLineIcon, ArrowUpToLineIcon, TrashIcon } from 'lucide-react'

export const TableRowMenu = React.memo(({ editor, appendTo }: MenuProps): JSX.Element => {
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
        placement: 'left',
        offset: [0, 15],
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
      }}
      shouldShow={shouldShow}
    >
      <div className="min-w-[16rem] rounded-[8px] flex flex-col border border-light-grey shadow bg-white p-2 cursor-none">
        <div
          className="flex items-center p-1.5 gap-2 hover:bg-very-light-grey rounded cursor-pointer !text-dark-grey hover:!text-fake-black"
          onClick={onAddRowBefore}
        >
          <div><ArrowUpToLineIcon width={20} height={20} /></div>
          <span className="text-sm font-medium">Add row before</span>
        </div>

        <div
          className="flex items-center p-1.5 gap-2 hover:bg-very-light-grey rounded cursor-pointer !text-dark-grey hover:!text-fake-black"
          onClick={onAddRowAfter}
        >
          <div><ArrowDownToLineIcon width={20} height={20} /></div>
          <span className="text-sm font-medium">Add row after</span>
        </div>

        <div
          className="flex items-center p-1.5 gap-2 hover:bg-very-light-grey rounded cursor-pointer !text-dark-grey hover:!text-fake-black"
          onClick={onDeleteRow}
        >
          <div><TrashIcon width={20} height={20} /></div>
          <span className="text-sm font-medium">Delete row</span>
        </div>
      </div>
    </BaseBubbleMenu>
  )
})

TableRowMenu.displayName = 'TableRowMenu'

export default TableRowMenu