import { Icon } from '@/components/ui/Icon';
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { LinkEditorPanel } from '@/components/pannels/LinkEditorPanel/LinkEditorPanel';

export type EditLinkPopoverProps = {
  onSetLink: (link: string, openInNewTab?: boolean) => void
}

export const EditLinkPopover = ({ onSetLink }: EditLinkPopoverProps) => {
  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button variant="light" size="sm" isIconOnly>
          <Icon name="Link" className="text-foreground-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <LinkEditorPanel onSetLink={onSetLink} />
      </PopoverContent>
    </Popover>
  )
}

EditLinkPopover.displayName = 'EditLinkPopover'

export default EditLinkPopover