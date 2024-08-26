import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Tooltip } from '@nextui-org/react'
import { useCallback } from 'react'

const FONT_FAMILY_GROUPS = [
  {
    label: 'Sans Serif',
    options: [
      { label: 'Inter', value: '' },
      { label: 'Arial', value: 'Arial' },
      { label: 'Helvetica', value: 'Helvetica' },
    ],
  },
  {
    label: 'Serif',
    options: [
      { label: 'Times New Roman', value: 'Times' },
      { label: 'Garamond', value: 'Garamond' },
      { label: 'Georgia', value: 'Georgia' },
    ],
  },
  {
    label: 'Monospace',
    options: [
      { label: 'Courier', value: 'Courier' },
      { label: 'Courier New', value: 'Courier New' },
    ],
  },
]

const FONT_FAMILIES = FONT_FAMILY_GROUPS.flatMap(group => [group.options]).flat()

export type FontFamilyPickerProps = {
  onChange: (value: string) => void // eslint-disable-line no-unused-vars
  value: string
}

export const FontFamilyPicker = ({ onChange, value }: FontFamilyPickerProps) => {
  const currentValue = FONT_FAMILIES.find(size => size.value === value)
  const currentFontLabel = currentValue?.label.split(' ')[0] || 'Inter'
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

  const selectFont = useCallback((font: string) => () => onChange(font), [onChange])

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button size={"sm"} variant={"light"}>
          <Tooltip
            content={"Font family"}
            delay={0}
            closeDelay={0}
            motionProps={motionProps}
          >
            <p className="text-foreground-500 font-medium text-base">{currentFontLabel}</p>
          </Tooltip>
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Actions" variant="flat">
        {FONT_FAMILY_GROUPS?.map(group => {
          return (
            <DropdownSection key={group?.label} title={group?.label}>
              {group?.options?.map(font => {
                return (
                  <DropdownItem
                    key={font?.value}
                    onClick={selectFont(font?.value)}
                    style={{ fontFamily: font?.value }}
                  >
                    {font?.label}
                  </DropdownItem>
                )
              })}
            </DropdownSection>
          )
        })}
      </DropdownMenu>
    </Dropdown>

    // Old Design
    // <Dropdown.Root>
    //   <Dropdown.Trigger asChild>
    //     <Toolbar.Button active={!!currentValue?.value}>
    //       {currentFontLabel}
          
    //       <Icon name="ChevronDown" className="w-2 h-2" />
    //     </Toolbar.Button>
    //   </Dropdown.Trigger>

    //   <Dropdown.Content asChild>
    //     <Surface className="flex flex-col gap-1 px-2 py-4">
    //       {FONT_FAMILY_GROUPS.map(group => (
    //         <div className="mt-2.5 first:mt-0 gap-0.5 flex flex-col" key={group.label}>
    //           <DropdownCategoryTitle>
    //             {group.label}
    //           </DropdownCategoryTitle>

    //           {group.options.map(font => (
    //             <DropdownButton
    //               isActive={value === font.value}
    //               onClick={selectFont(font.value)}
    //               key={`${font.label}_${font.value}`}
    //             >
    //               <span style={{ fontFamily: font.value }}>{font.label}</span>
    //             </DropdownButton>
    //           ))}
    //         </div>
    //       ))}
    //     </Surface>
    //   </Dropdown.Content>
    // </Dropdown.Root>
  )
}

FontFamilyPicker.displayName = 'FontFamilyPicker'

export default FontFamilyPicker