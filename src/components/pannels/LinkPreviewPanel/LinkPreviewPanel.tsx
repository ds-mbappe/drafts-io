import { Icon } from '@/components/ui/Icon'
import { Surface } from '@/components/ui/Surface'
import { Button, Divider } from '@nextui-org/react'

export type LinkPreviewPanelProps = {
  url: string
  onEdit: () => void
  onClear: () => void
}

export const LinkPreviewPanel = ({ onClear, onEdit, url }: LinkPreviewPanelProps) => {
  return (
    <Surface className="flex items-center gap-2 p-2">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all">
        {url}
      </a>

      <Divider />

      <Button variant="light" onPress={onEdit}>
        <Icon name="Pen" />
      </Button>

      <Button variant="light" onPress={onClear}>
        <Icon name="Trash2" />
      </Button>
    </Surface>
  )
}

LinkPreviewPanel.displayName = 'LinkPreviewPanel'

export default LinkPreviewPanel