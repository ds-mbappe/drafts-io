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
          <Tooltip
            content={"Convert to"}
            delay={0}
            closeDelay={0}
            motionProps={motionProps}
          >
            <PilcrowIcon className="text-foreground-500" size={20} />
          </Tooltip>
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


    // Old Design
    // <Dropdown.Root>
    //   <Dropdown.Trigger asChild>
    //     <Toolbar.Button active={activeItem?.id !== 'paragraph' && !!activeItem?.type}>
    //       <Icon name={(activeItem?.type === 'option' && activeItem.icon) || 'Pilcrow'} />

    //       <Icon name="ChevronDown" className="w-2 h-2" />
    //     </Toolbar.Button>
    //   </Dropdown.Trigger>

    //   <Dropdown.Content asChild>
    //     <Surface className="flex flex-col gap-1 px-2 py-4">
    //       {options.map(option => {
    //         if (isOption(option)) {
    //           return (
    //             <DropdownButton key={option.id} onClick={option.onClick} isActive={option.isActive()}>
    //               <Icon name={option.icon} className="w-4 h-4 mr-1" />
                  
    //               {option.label}
    //             </DropdownButton>
    //           )
    //         } else if (isCategory(option)) {
    //           return (
    //             <div className="mt-2 first:mt-0" key={option.id}>
    //               <DropdownCategoryTitle key={option.id}>{option.label}</DropdownCategoryTitle>
    //             </div>
    //           )
    //         }
    //       })}
    //     </Surface>
    //   </Dropdown.Content>
    // </Dropdown.Root>
  )
}

ContentTypePicker.displayName = 'ContentTypePicker'

export default ContentTypePicker