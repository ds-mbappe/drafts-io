import { LinkEditorPanel } from '@/components/pannels/LinkEditorPanel/LinkEditorPanel'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@nextui-org/react'
import * as Popover from '@radix-ui/react-popover'

export type EditLinkPopoverProps = {
  onSetLink: (link: string, openInNewTab?: boolean) => void
}

export const EditLinkPopover = ({ onSetLink }: EditLinkPopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="light">
          <Icon name="Link" />
        </Button>
      </Popover.Trigger>
      
      <Popover.Content>
        <LinkEditorPanel onSetLink={onSetLink} />
      </Popover.Content>
    </Popover.Root>
  )
}

EditLinkPopover.displayName = 'EditLinkPopover'

export default EditLinkPopover