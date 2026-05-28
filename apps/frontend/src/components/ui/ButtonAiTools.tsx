import { Button, Dropdown, Label } from '@heroui/react';
import React, { useRef, useState } from 'react'
import { TiptopEditorSlotProps } from 'tiptop-editor';
import { LanguagesIcon } from 'lucide-react';
import { languages } from '@/app/constants';
import { useTranslations } from 'next-intl';
import { useAuthFetcher } from '@/hooks/useAuthFetcher';
import { errorToast, infoToast } from '@/actions/showToast';
import { extractTexts, getSelectionContent, rebuildContent, selectionHasMarks, streamInsertText } from '@/lib/editor';

const ButtonAiTools = (props: TiptopEditorSlotProps) => {
  const t = useTranslations('aiTools');
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const cancelledRef = useRef(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const { fetcher, token } = useAuthFetcher();

  const cancelStream = () => {
    cancelledRef.current = true;
    readerRef.current?.cancel();
    readerRef.current = null;
    setIsTranslating(false);
    infoToast(t('translationCancelled'));
  };

  const handleTranslate = async (languageTitle: string) => {
    const { editor } = props;
    const { from, to, empty } = editor.state.selection;

    if (empty) {
      errorToast(t('selectTextError'));
      return;
    }

    setDropdownOpened(false);
    setIsTranslating(true);
    cancelledRef.current = false;

    const hasMarks = selectionHasMarks(editor, from, to);

    try {
      if (hasMarks) {
        const content = getSelectionContent(editor, from, to);
        const texts = extractTexts(content);
        const result = await fetcher('/api/ai/translate/batch', {
          method: 'POST',
          body: { texts, language: languageTitle },
        });
        const translated = rebuildContent(content, result.texts);
        editor.chain().focus().insertContentAt({ from, to }, translated).run();
      } else {
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        await streamInsertText({
          editor,
          url: '/api/ai/translate/stream',
          token: token!,
          body: { text: selectedText, language: languageTitle },
          from,
          to,
          onCancel: cancelStream,
          cancelledRef,
          readerRef,
        });
      }
    } catch {
      if (!cancelledRef.current) errorToast(t('translationFailed'));
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Dropdown isOpen={dropdownOpened} onOpenChange={setDropdownOpened}>
      <Dropdown.Trigger>
        <Button
          size="sm"
          variant='ghost'
          className="text-foreground-500 hover:text-foreground"
          isPending={isTranslating}
        >
          {isTranslating ? t('translating') : t('aiTools')}
        </Button>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="top">
        <Dropdown.Menu className="w-[225px]">
          <Dropdown.SubmenuTrigger>
            <Dropdown.Item
              id="translate"
              textValue="translate"
              className='text-foreground-500 hover:text-foreground outline-none'
            >
              <LanguagesIcon size={16} />
              <Label>{t('translateTo')}</Label>
              <Dropdown.SubmenuIndicator />
            </Dropdown.Item>
            <Dropdown.Popover>
              <Dropdown.Menu
                aria-label="Translate to"
                onAction={(key) => handleTranslate(languages.find(l => l.key === key)?.title ?? String(key))}
              >
                {languages.map((language) => (
                  <Dropdown.Item
                    key={language.key}
                    id={language.key}
                    textValue={language.title}
                    className='text-foreground-500 hover:text-foreground outline-none'
                  >
                    {language.title}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown.SubmenuTrigger>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}

ButtonAiTools.displayName = 'ButtonAiTools'

export default ButtonAiTools
