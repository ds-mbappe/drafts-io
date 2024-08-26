import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Tooltip } from '@nextui-org/react'
import { useCallback } from 'react'

const FONT_SIZES = [
  { label: 'Smaller', value: '12px' },
  { label: 'Small', value: '14px' },
  { label: 'Medium', value: '' },
  { label: 'Large', value: '18px' },
  { label: 'Extra Large', value: '24px' },
]

export type FontSizePickerProps = {
  onChange: (value: string) => void // eslint-disable-line no-unused-vars
  value: string
}

export const FontSizePicker = ({ onChange, value }: FontSizePickerProps) => {
  const currentValue = FONT_SIZES.find(size => size.value === value)
  const currentSizeLabel = currentValue?.label.split(' ')[0] || 'Medium'
  const motionProps = {
    variants: {
      exit: {
        opacity: 0,
        transition: {
          duration: 0.15,
          ease: "easeIn",
        }
      },
      enter: {
        opacity: 1,
        transition: {
          duration: 0.15,
          ease: "easeOut",
        }
      },
    },
  }

  const selectSize = useCallback((size: string) => () => onChange(size), [onChange])

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button size={"sm"} variant={"light"}>
          <Tooltip
            content={"Font size"}
            delay={0}
            closeDelay={0}
            motionProps={motionProps}
          >
            <p className="text-foreground-500 font-medium text-base">{currentSizeLabel}</p>
          </Tooltip>
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Actions" variant="flat">
        {FONT_SIZES?.map(fontSize => {
          return (
            <DropdownItem
              key={fontSize?.value}
              textValue="font"
              onClick={selectSize(fontSize?.value)}
            >
              <span style={{ fontSize: fontSize?.value }}>{fontSize?.label}</span>
            </DropdownItem>
          )
        })}
      </DropdownMenu>
    </Dropdown>

    // Old design
    // <Dropdown.Root>
    //   <Dropdown.Trigger asChild>
    //     <Toolbar.Button active={!!currentValue?.value}>
    //       {currentSizeLabel}
    //       <Icon name="ChevronDown" className="w-2 h-2" />
    //     </Toolbar.Button>
    //   </Dropdown.Trigger>

    //   <Dropdown.Content asChild>
    //     <Surface className="flex flex-col gap-1 px-2 py-4">
    //       {FONT_SIZES.map(size => (
    //         <DropdownButton
    //           isActive={value === size.value}
    //           onClick={selectSize(size.value)}
    //           key={`${size.label}_${size.value}`}
    //         >
    //           <span style={{ fontSize: size.value }}>{size.label}</span>
    //         </DropdownButton>
    //       ))}
    //     </Surface>
    //   </Dropdown.Content>
    // </Dropdown.Root>
  )
}

FontSizePicker.displayName = 'FontSizePicker'

export default FontSizePicker