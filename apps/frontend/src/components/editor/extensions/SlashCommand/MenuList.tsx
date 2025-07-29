import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { icons } from 'lucide-react'
import { Command, MenuListProps } from './types'
import { Listbox, ListboxItem, ListboxSection, } from "@heroui/react";

export type IconProps = {
  name: keyof typeof icons
  className?: string
  strokeWidth?: number
}

const MenuList = React.forwardRef((props: MenuListProps, ref) => {
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

  Icon.displayName = 'Icon'

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
      const itemTop = activeItem.current.offsetTop;
      const itemBottom = itemTop + activeItem.current.offsetHeight;

      const containerTop = scrollContainer.current.scrollTop;
      const containerBottom = containerTop + scrollContainer.current.offsetHeight;

      if (itemTop < containerTop) {
        // Scroll up to the item
        scrollContainer.current.scrollTo({
          top: itemTop - 25,
          behavior: 'smooth',
        });
      } else if (itemBottom > containerBottom) {
        // Scroll down to the item
        scrollContainer.current.scrollTo({
          top: itemBottom - scrollContainer.current.offsetHeight + 25,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedCommandIndex, selectedGroupIndex]);

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
    <div className="w-full max-w-[275px] px-1 py-2 overflow-hidden bg-content1 rounded-xl border border-default-200 dark:border-default-100" ref={scrollContainer}>
      <div aria-label="Listbox menu with sections" className="flex flex-col max-h-[min(80vh,24rem)] overflow-y-auto gap-2">
        {props.items.map((group, groupIndex: number) => (
          <div key={`${group?.title}-wrapper`}>
            <p className="px-1 text-gray-500 font-medium text-sm">
              {group?.title}
            </p>

            {group.commands.map((command: Command, commandIndex: number) => {
              const isSelected = (commandIndex === selectedCommandIndex && groupIndex === selectedGroupIndex);

              return (
                // <ListboxItem
                //   as={'div'}
                //   key={commandIndex}
                //   textValue={`${command.label}_${commandIndex}`}
                //   description={command?.description}
                //   startContent={<Icon name={command?.iconName} className="w-10 h-10" />}
                //   onClick={createCommandClickHandler(groupIndex, commandIndex)}
                // >
                //   {command?.label}
                // </ListboxItem>
                <button
                  key={commandIndex}
                  ref={isSelected ? activeItem : null}
                  className={`flex w-full items-center gap-2 p-1.5 text-left text-sm rounded-xl text-foreground dark:text-background hover:bg-divider ${isSelected ? "bg-primary-50" : ""
                    }`}
                  onClick={createCommandClickHandler(groupIndex, commandIndex)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-divider bg-content1 dark:bg-foreground">
                    <Icon name={command.iconName} className="w-10 h-10" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-foreground">{command.label}</p>
                    <p className="text-xs text-gray-500">{command.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
})

MenuList.displayName = 'MenuList'

export default MenuList