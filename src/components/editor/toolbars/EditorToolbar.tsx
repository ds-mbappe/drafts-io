import { Button, cn, Divider, Navbar, Popover, PopoverContent, PopoverTrigger } from '@heroui/react'
import { Editor } from '@tiptap/react'
import { Icon } from '@/components/ui/Icon'
import React, { memo } from 'react'
import EditLinkPopover from '../menus/TextMenu/components/EditLinkPopover'
import { useCanUndo, useCanRedo } from '../extensions/ImageUpload/view/hooks'
import { useTextMenuCommands } from '../hooks/useTextMenuCommands'
import { useTextMenuContentTypes } from '../hooks/useTextMenuContentTypes'
import { useTextMenuStates } from '../hooks/useTextMenuStates'
import ColorPicker from '@/components/pannels/ColorPicker/ColorPicker'
import ContentTypePicker from '../menus/TextMenu/components/ContentTypePicker'
import FontFamilyPicker from '../menus/TextMenu/components/FontFamilyPicker'
import FontSizePicker from '../menus/TextMenu/components/FontSizePicker'

const EditorToolbar = ({
  editor,
  documentId,
  }: {
    editor: Editor | null,
    documentId?: string,
  }) => {
  const MemoButton = memo(Button);
  const MemoColorPicker = memo(ColorPicker);
  const MemoFontSizePicker = memo(FontSizePicker);
  const MemoFontFamilyPicker = memo(FontFamilyPicker);
  const MemoContentTypePicker = memo(ContentTypePicker);

  const canUndo = useCanUndo(editor);
  const canRedo = useCanRedo(editor);
  const states = useTextMenuStates(editor!);
  const commands = useTextMenuCommands(editor!);
  const blockOptions = useTextMenuContentTypes(editor!);

  return (
    <Navbar
      isBordered
      height={44}
      maxWidth={"full"}
      isBlurred={false}
      // className={cn(
      //   "md:rounded-t-lg bottom-0 fixed md:top-0 md:relative h-fit",
      //   documentId ? 'top-[128px]' : 'top-[64px]'
      // )}
      classNames={{
        wrapper: 'w-full flex justify-normal md:justify-center items-center px-1 gap-0.5 overflow-x-auto hideScrollbar'
      }}
    >
      {editor && (
        <>
          <MemoButton variant="light" size="sm" onPress={commands.onUndo} color="default" isIconOnly isDisabled={!canUndo}>
            <Icon name="Undo" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onRedo} color="default" isIconOnly isDisabled={!canRedo}>
            <Icon name="Redo" className="text-foreground-500" />
          </MemoButton>

          <Divider orientation="vertical" className="h-7 mx-0.5" />

          <MemoContentTypePicker options={blockOptions} />

          <MemoButton variant="light" size="sm" onPress={commands.onBlockQuote} color="default" isIconOnly>
            <Icon name="TextQuote" className="text-foreground-500" />
          </MemoButton>
          
          {/* <MemoFontFamilyPicker onChange={commands.onSetFont} value={states.currentFont || ''} />

          <MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ''} /> */}

          <Divider orientation="vertical" className="h-7 mx-0.5" />

          <MemoButton variant="light" size="sm" onPress={commands.onBold} color="default" isIconOnly>
            <Icon name="Bold" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onItalic} color="default" isIconOnly>
            <Icon name="Italic" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onUnderline} color="default" isIconOnly>
            <Icon name="Underline" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onStrike} color="default" isIconOnly>
            <Icon name="Strikethrough" className="text-foreground-500" />
          </MemoButton>
          

          <MemoButton variant="light" size="sm" onPress={commands.onCode} color="default" isIconOnly>
            <Icon name="Braces" className="text-foreground-500" />
          </MemoButton>
          
          <MemoButton variant="light" size="sm" onPress={commands.onCodeBlock} isIconOnly>
            <Icon name="Code" className="text-foreground-500" />
          </MemoButton>

          <EditLinkPopover onSetLink={commands.onLink} />

          <Popover placement="bottom">
            <PopoverTrigger>
              <MemoButton variant="light" size="sm" isIconOnly>
                <Icon name="Highlighter" className="text-foreground-500" />
              </MemoButton>
            </PopoverTrigger>

            <PopoverContent>
              <MemoColorPicker
                color={states.currentHighlight}
                onChange={commands.onChangeHighlight}
                onClear={commands.onClearHighlight}
              />
            </PopoverContent>
          </Popover>

          <Popover placement="bottom">
            <PopoverTrigger>
              <MemoButton variant="light" size="sm" isIconOnly>
                <Icon name="Palette" className="text-foreground-500" />
              </MemoButton>
            </PopoverTrigger>

            <PopoverContent>
              <MemoColorPicker
                color={states.currentColor}
                onChange={commands.onChangeColor}
                onClear={commands.onClearColor}
              />
            </PopoverContent>
          </Popover>

          <Divider orientation="vertical" className="h-7 mx-0.5" />

          <MemoButton variant="light" size="sm" onPress={commands.onSubscript} isIconOnly>
            <Icon name="Subscript" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onSuperscript} isIconOnly>
            <Icon name="Superscript" className="text-foreground-500" />
          </MemoButton>

          <Divider orientation="vertical" className="h-7 mx-0.5" />

          <MemoButton variant="light" size="sm" onPress={commands.onAlignLeft} isIconOnly>
            <Icon name="AlignLeft" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onAlignCenter} isIconOnly>
            <Icon name="AlignCenter" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onAlignRight} isIconOnly>
            <Icon name="AlignRight" className="text-foreground-500" />
          </MemoButton>

          <MemoButton variant="light" size="sm" onPress={commands.onAlignJustify} isIconOnly>
            <Icon name="AlignJustify" className="text-foreground-500" />
          </MemoButton>
        </>
      )}
    </Navbar>
  )
}

export default EditorToolbar