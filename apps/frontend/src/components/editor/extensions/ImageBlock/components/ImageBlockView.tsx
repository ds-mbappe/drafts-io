import { Node } from '@tiptap/pm/model';
import { useCallback, useRef } from 'react';
import { Editor, NodeViewWrapper } from '@tiptap/react';
import { cn } from '@heroui/theme';

interface ImageBlockViewProps {
  editor: Editor
  getPos: () => number
  node: Node & {
    attrs: {
      src: string
    }
  }
  updateAttributes: (attrs: Record<string, string>) => void
}

export const ImageBlockView = (props: any) => {
  const { editor, getPos, node } = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const { src } = node.attrs

  const wrapperClassName = cn(
    node.attrs.align === 'left' ? 'ml-0' : 'ml-auto',
    node.attrs.align === 'right' ? 'mr-0' : 'mr-auto',
    node.attrs.align === 'center' && 'mx-auto',
  )

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos())
  }, [getPos, editor.commands])

  return (
    <NodeViewWrapper>
      <div className={wrapperClassName} style={{ width: node.attrs.width }}>
        <div contentEditable={false} ref={imageWrapperRef} className="border border-divider rounded-[12px]">
          <img className="block rounded-[12px] cursor-pointer" src={src} alt="" onClick={onClick} />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default ImageBlockView