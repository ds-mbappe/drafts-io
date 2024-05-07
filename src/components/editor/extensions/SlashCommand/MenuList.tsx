import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { icons } from 'lucide-react'
import { Command, MenuListProps } from './types'
import { Surface } from '@/components/ui/Surface'

export type IconProps = {
  name: keyof typeof icons
  className?: string
  strokeWidth?: number
}

export const MenuList = React.forwardRef((props: MenuListProps, ref) => {
  const scrollContainer = useRef<HTMLDivElement>(null)
  const activeItem = useRef<HTMLButtonElement>(null)
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)

  // Anytime the groups change, i.e. the user types to narrow it down, we want to
  // reset the current selection to the first menu item
  useEffect(() => {
    setSelectedGroupIndex(0)
    setSelectedCommandIndex(0)
  }, [props.items])

  const selectItem = useCallback(
    (groupIndex: number, commandIndex: number) => {
      const command = props.items[groupIndex].commands[commandIndex]
      props.command(command)
    },
    [props],
  )

  const Icon = memo(({ name, className, strokeWidth }: IconProps) => {
    const IconComponent = icons[name]
  
    if (!IconComponent) {
      return null
    }
  
    return <IconComponent />
  })

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
      if (event.key === 'ArrowDown') {
        if (!props.items.length) {
          return false
        }

        const commands = props.items[selectedGroupIndex].commands

        let newCommandIndex = selectedCommandIndex + 1
        let newGroupIndex = selectedGroupIndex

        if (commands.length - 1 < newCommandIndex) {
          newCommandIndex = 0
          newGroupIndex = selectedGroupIndex + 1
        }

        if (props.items.length - 1 < newGroupIndex) {
          newGroupIndex = 0
        }

        setSelectedCommandIndex(newCommandIndex)
        setSelectedGroupIndex(newGroupIndex)

        return true
      }

      if (event.key === 'ArrowUp') {
        if (!props.items.length) {
          return false
        }

        let newCommandIndex = selectedCommandIndex - 1
        let newGroupIndex = selectedGroupIndex

        if (newCommandIndex < 0) {
          newGroupIndex = selectedGroupIndex - 1
          newCommandIndex = props.items[newGroupIndex]?.commands.length - 1 || 0
        }

        if (newGroupIndex < 0) {
          newGroupIndex = props.items.length - 1
          newCommandIndex = props.items[newGroupIndex].commands.length - 1
        }

        setSelectedCommandIndex(newCommandIndex)
        setSelectedGroupIndex(newGroupIndex)

        return true
      }

      if (event.key === 'Enter') {
        if (!props.items.length || selectedGroupIndex === -1 || selectedCommandIndex === -1) {
          return false
        }

        selectItem(selectedGroupIndex, selectedCommandIndex)

        return true
      }

      return false
    },
  }))

  useEffect(() => {
    if (activeItem.current && scrollContainer.current) {
      const offsetTop = activeItem.current.offsetTop
      const offsetHeight = activeItem.current.offsetHeight

      scrollContainer.current.scrollTop = offsetTop - offsetHeight
    }
  }, [selectedCommandIndex, selectedGroupIndex])

  const createCommandClickHandler = useCallback(
    (groupIndex: number, commandIndex: number) => {
      return () => {
        selectItem(groupIndex, commandIndex)
      }
    },
    [selectItem],
  )

  if (!props.items.length) {
    return null
  }

  return (
    <Surface ref={scrollContainer} className="text-black max-h-[min(80vh,24rem)] overflow-auto flex-wrap p-2">
      <div className="grid grid-cols-1 gap-0.5">
        {props.items.map((group, groupIndex: number) => (
          <React.Fragment key={`${group.title}-wrapper`}>
            <div
              className="text-neutral-500 text-[0.65rem] col-[1/-1] mx-2 mt-4 font-semibold tracking-wider select-none uppercase first:mt-0.5"
              key={`${group.title}`}
            >
              {group.title}
            </div>
            {group.commands.map((command: Command, commandIndex: number) => {
              const isSelected = (commandIndex === selectedCommandIndex && groupIndex === selectedGroupIndex);
              
              return (
                <button
                  ref={isSelected ? activeItem : null}
                  className={`flex w-full items-center space-x-2 rounded-md p-1 text-left text-sm text-gray-900 hover:bg-gray-100 ${
                    isSelected ? "bg-gray-100 text-gray-900" : ""
                  }`}
                  key={commandIndex}
                  onClick={createCommandClickHandler(groupIndex, commandIndex)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white">
                    <Icon name={command.iconName} className="w-10 h-10" />
                  </div>
                  <div className="max-w-[175px]">
                    <p className="font-medium">{command.label}</p>
                    <p className="text-xs text-gray-500">{command.description}</p>
                  </div>
                </button>
                )
            })}
          </React.Fragment>
        ))}
      </div>
    </Surface>
  )
})

MenuList.displayName = 'MenuList'

export default MenuList