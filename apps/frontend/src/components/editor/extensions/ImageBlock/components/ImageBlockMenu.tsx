import { v4 as uuid } from 'uuid';
import deepEql from 'fast-deep-equal';
import { Instance, sticky } from 'tippy.js';
import React, { useCallback, useRef } from 'react';
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react';
import { Icon } from '@/components/ui/Icon'
import { ImageBlockWidth } from './ImageBlockWidth'
import { MenuProps } from '../../../menus/types'
import { getRenderContainer } from '../../../../editor/utils/getRenderContainer'
import { Button, Divider, Tooltip } from "@heroui/react";
import { AlignHorizontalDistributeCenterIcon, AlignHorizontalDistributeEndIcon, AlignHorizontalDistributeStartIcon } from 'lucide-react';

export const ImageBlockMenu = ({ editor, appendTo }: MenuProps): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null)
  const tippyInstance = useRef<Instance | null>(null)
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

  const getReferenceClientRect = useCallback(() => {
    const renderContainer = getRenderContainer(editor, 'node-imageBlock')
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0)

    return rect
  }, [editor])

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive('imageBlock')

    return isActive
  }, [editor])

  const onAlignImageLeft = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('left').run()
  }, [editor])

  const onAlignImageCenter = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('center').run()
  }, [editor])

  const onAlignImageRight = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('right').run()
  }, [editor])

  const onWidthChange = useCallback(
    (value: number) => {
      editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockWidth(value).run()
    },
    [editor],
  )
  const { isImageCenter, isImageLeft, isImageRight, width } = useEditorState({
    editor,
    selector: ctx => {
      return {
        isImageLeft: ctx.editor.isActive('imageBlock', { align: 'left' }),
        isImageCenter: ctx.editor.isActive('imageBlock', { align: 'center' }),
        isImageRight: ctx.editor.isActive('imageBlock', { align: 'right' }),
        width: parseInt(ctx.editor.getAttributes('imageBlock')?.width || 0),
      }
    },
    equalityFn: deepEql,
  })

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey={`imageBlockMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        offset: [0, 8],
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
        // getReferenceClientRect,
        onCreate: (instance: Instance) => {
          tippyInstance.current = instance
        },
        appendTo: () => {
          return appendTo?.current
        },
        plugins: [sticky],
        sticky: 'popper',
      }}
    >
      <div className="w-full flex items-center gap-2 rounded-[12px] border border-divider shadow p-2">
        <Tooltip
          content={"Align left"}
          delay={0}
          closeDelay={0}
          // motionProps={motionProps}
        >
          <Button isIconOnly size={"sm"} variant={"light"} onClick={onAlignImageLeft}>
            <AlignHorizontalDistributeStartIcon />
          </Button>
        </Tooltip>

        <Tooltip
          content={"Align center"}
          delay={0}
          closeDelay={0}
          // motionProps={motionProps}
        >
          <Button isIconOnly size={"sm"} variant={"light"} onClick={onAlignImageCenter}>
            <AlignHorizontalDistributeCenterIcon />
          </Button>
        </Tooltip>

        <Tooltip
          content={"Align right"}
          delay={0}
          closeDelay={0}
          // motionProps={motionProps}
        >
          <Button isIconOnly size={"sm"} variant={"light"} onClick={onAlignImageRight}>
            <AlignHorizontalDistributeEndIcon />
          </Button>
        </Tooltip>

        <Divider />

        <ImageBlockWidth onChange={onWidthChange} value={width} />
      </div>
    </BaseBubbleMenu>
  )
}

export default ImageBlockMenu