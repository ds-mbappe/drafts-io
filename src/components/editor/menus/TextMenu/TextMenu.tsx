import { Icon } from '@/components/ui/Icon'
import { useTextMenuCommands } from '../../hooks/useTextMenuCommands'
import { useTextMenuStates } from '../../hooks/useTextMenuStates'
import { BubbleMenu, Editor } from '@tiptap/react'
import { memo } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Surface } from '@/components/ui/Surface'
import { ColorPicker } from '@/components/pannels/ColorPicker/ColorPicker'
import { FontFamilyPicker } from './components/FontFamilyPicker'
import { FontSizePicker } from './components/FontSizePicker'
import { useTextMenuContentTypes } from '../../hooks/useTextMenuContentTypes'
import { ContentTypePicker } from './components/ContentTypePicker'
import { EditLinkPopover } from './components/EditLinkPopover'
import { Button, Card, CardBody, Tooltip } from '@nextui-org/react'

// We memorize the button so each button is not rerendered every editor state change
const MemoColorPicker = memo(ColorPicker)
const MemoFontFamilyPicker = memo(FontFamilyPicker)
const MemoFontSizePicker = memo(FontSizePicker)
const MemoContentTypePicker = memo(ContentTypePicker)

export type TextMenuProps = {
  editor: Editor
}

export const TextMenu = ({ editor }: TextMenuProps) => {
  const states = useTextMenuStates(editor)
  const commands = useTextMenuCommands(editor)
  const blockOptions = useTextMenuContentTypes(editor)
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
    <BubbleMenu
      tippyOptions={{ popperOptions: { placement: 'top-start' }, duration: 250 }}
      editor={editor}
      pluginKey="textMenu"
      shouldShow={states.shouldShow}
    >
      <Card>
        <CardBody className="flex flex-row gap-1">
          <MemoContentTypePicker options={blockOptions} />

          <MemoFontFamilyPicker onChange={commands.onSetFont} value={states.currentFont || ''} />

          <MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ''} />

          <Button variant="light" size="sm" onPress={commands.onBold} color="default" isIconOnly>
            {/* <Tooltip
              content={"Bold"}
              delay={0}
              closeDelay={0}
              motionProps={motionProps}
            >
            </Tooltip> */}
              <Icon name="Bold" className="text-foreground-500" />
          </Button>

          <Button variant="light" size="sm" onPress={commands.onItalic} color="default" isIconOnly>
            {/* <Tooltip
              content={"Italic"}
              delay={0}
              closeDelay={0}
              motionProps={motionProps}
            >
            </Tooltip> */}
              <Icon name="Italic" className="text-foreground-500" />
          </Button>

          <Button variant="light" size="sm" onPress={commands.onUnderline} color="default" isIconOnly>
            {/* <Tooltip
              content={"Underline"}
              delay={0}
              closeDelay={0}
              motionProps={motionProps}
            >
            </Tooltip> */}
              <Icon name="Underline" className="text-foreground-500" />
          </Button>

          <Button variant="light" size="sm" onPress={commands.onStrike} color="default" isIconOnly>
            {/* <Tooltip
              content={"Striketrough"}
              delay={0}
              closeDelay={0}
              motionProps={motionProps}
            >
            </Tooltip> */}
              <Icon name="Strikethrough" className="text-foreground-500" />
          </Button>
          
          <Button variant="light" size="sm" onPress={commands.onCodeBlock} isIconOnly>
            {/* <Tooltip
              content={"Code block"}
              delay={0}
              closeDelay={0}
              motionProps={motionProps}
            >
            </Tooltip> */}
              <Icon name="Code" className="text-foreground-500" />
          </Button>
        </CardBody>
      </Card>
      {/* <Toolbar.Wrapper>


        <EditLinkPopover onSetLink={commands.onLink} />

        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton active={!!states.currentHighlight} tooltip="Highlight text">
              <Icon name="Highlighter" />
            </MemoButton>
          </Popover.Trigger>

          <Popover.Content side="top" sideOffset={8} asChild>
            <Surface className="p-1">
              <MemoColorPicker
                color={states.currentHighlight}
                onChange={commands.onChangeHighlight}
                onClear={commands.onClearHighlight}
              />
            </Surface>
          </Popover.Content>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton active={!!states.currentColor} tooltip="Text color">
              <Icon name="Palette" />
            </MemoButton>
          </Popover.Trigger>

          <Popover.Content side="top" sideOffset={8} asChild>
            <Surface className="p-1">
              <MemoColorPicker
                color={states.currentColor}
                onChange={commands.onChangeColor}
                onClear={commands.onClearColor}
              />
            </Surface>
          </Popover.Content>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton tooltip="More options">
              <Icon name="EllipsisVertical" />
            </MemoButton>
          </Popover.Trigger>

          <Popover.Content side="top" asChild>
            <Toolbar.Wrapper>
              <MemoButton
                tooltip="Subscript"
                tooltipShortcut={['Mod', '.']}
                onClick={commands.onSubscript}
                active={states.isSubscript}
              >
                <Icon name="Subscript" />
              </MemoButton>

              <MemoButton
                tooltip="Superscript"
                tooltipShortcut={['Mod', ',']}
                onClick={commands.onSuperscript}
                active={states.isSuperscript}
              >
                <Icon name="Superscript" />
              </MemoButton>

              <Toolbar.Divider />

              <MemoButton
                tooltip="Align left"
                tooltipShortcut={['Shift', 'Mod', 'L']}
                onClick={commands.onAlignLeft}
                active={states.isAlignLeft}
              >
                <Icon name="AlignLeft" />
              </MemoButton>

              <MemoButton
                tooltip="Align center"
                tooltipShortcut={['Shift', 'Mod', 'E']}
                onClick={commands.onAlignCenter}
                active={states.isAlignCenter}
              >
                <Icon name="AlignCenter" />
              </MemoButton>

              <MemoButton
                tooltip="Align right"
                tooltipShortcut={['Shift', 'Mod', 'R']}
                onClick={commands.onAlignRight}
                active={states.isAlignRight}
              >
                <Icon name="AlignRight" />
              </MemoButton>

              <MemoButton
                tooltip="Justify"
                tooltipShortcut={['Shift', 'Mod', 'J']}
                onClick={commands.onAlignJustify}
                active={states.isAlignJustify}
              >
                <Icon name="AlignJustify" />
              </MemoButton>
            </Toolbar.Wrapper>
          </Popover.Content>
        </Popover.Root>
      </Toolbar.Wrapper> */}
    </BubbleMenu>
  )
}

TextMenu.displayName = "TextMenu"

export default TextMenu