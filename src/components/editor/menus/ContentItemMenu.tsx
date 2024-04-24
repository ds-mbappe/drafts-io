import { PlusIcon } from 'lucide-react';
import { Editor } from '@tiptap/react'
import DragHandle from '@tiptap-pro/extension-drag-handle-react'

import { useData } from '@/components/editor/hooks/useData';
import useContentItemActions from '@/components/editor/hooks/useContentItemActions';
import { useEffect, useState } from 'react';

export type ContentItemMenuProps = {
  editor: Editor
}

const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const data = useData()
  const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos)

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta('lockDragHandle', true)
    } else {
      editor.commands.setMeta('lockDragHandle', false)
    }
  }, [editor, menuOpen])

  return (
    <DragHandle
      pluginKey="ContentItemMenu"
      editor={editor}
      onNodeChange={data.handleNodeChange}
      tippyOptions={{
        offset: [-3, 16],
        zIndex: 99,
      }}
    >
      <div className="flex items-center gap-0.5">
        <div
          className="hover:bg-muted p-1 rounded cursor-pointer"
          onClick={actions.handleAdd}
        >
          <PlusIcon height={20} width={20} />
        </div>
      </div>
    </DragHandle>
  )
}

export default ContentItemMenu