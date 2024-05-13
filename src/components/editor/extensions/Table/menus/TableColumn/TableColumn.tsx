import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react'
import React, { useCallback } from 'react'
import { isColumnGripSelected } from './utils'
import { MenuProps, ShouldShowProps } from '@/components/editor/menus/types'
import { ArrowLeftToLineIcon, ArrowRightToLineIcon, TrashIcon } from 'lucide-react'

export const TableColumnMenu = React.memo(({ editor, appendTo }: MenuProps): JSX.Element => {
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
          onClick={onAddColumnBefore}
        >
          <div><ArrowLeftToLineIcon width={20} height={20} /></div>
          <span className="text-sm font-medium">Add column before</span>
        </div>

        <div
          className="flex items-center p-1.5 gap-2 hover:bg-very-light-grey rounded cursor-pointer !text-dark-grey hover:!text-fake-black"
          onClick={onAddColumnAfter}
        >
          <div><ArrowRightToLineIcon width={20} height={20} /></div>
          <span className="text-sm font-medium">Add column after</span>
        </div>

        <div
          className="flex items-center p-1.5 gap-2 hover:bg-very-light-grey rounded cursor-pointer !text-dark-grey hover:!text-fake-black"
          onClick={onDeleteColumn}
        >
          <div><TrashIcon width={20} height={20} /></div>
          <span className="text-sm font-medium">Delete column</span>
        </div>
      </div>
    </BaseBubbleMenu>
  )
})

TableColumnMenu.displayName = 'TableColumnMenu'

export default TableColumnMenu