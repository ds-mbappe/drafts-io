import { Icon } from '@/components/ui/Icon'
import { icons, PilcrowIcon } from 'lucide-react'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Tooltip } from '@nextui-org/react'

export type ContentTypePickerOption = {
  label: string
  id: string
  type: 'option'
  disabled: () => boolean
  isActive: () => boolean
  onClick: () => void
  icon: keyof typeof icons
}

export type ContentTypePickerCategory = {
  label: string
  id: string
  type: 'category'
  elements: ContentTypePickerOption[]
}

export type ContentPickerOptions = Array<ContentTypePickerCategory>

export type ContentTypePickerProps = {
  options: ContentPickerOptions
}

export const ContentTypePicker = ({ options }: ContentTypePickerProps) => {
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

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button isIconOnly size={"sm"} variant={"light"}>
          {/* <Tooltip
            content={"Convert into"}
            delay={0}
            closeDelay={0}
            motionProps={motionProps}
          >
          </Tooltip> */}
            <PilcrowIcon className="text-foreground-500" size={20} />
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Actions" variant="flat">
        {options?.map(option => {
          return (
            <DropdownSection key={option?.id} title={option?.label}>
              {option?.elements?.map(element => {
                return (
                  <DropdownItem
                    key={element?.id}
                    startContent={<Icon name={element?.icon} />}
                    onClick={element?.onClick}
                  >
                    {element?.label}
                  </DropdownItem>
                )
              })}
            </DropdownSection>
          )
        })}
      </DropdownMenu>
    </Dropdown>
  )
}

ContentTypePicker.displayName = 'ContentTypePicker'

export default ContentTypePicker