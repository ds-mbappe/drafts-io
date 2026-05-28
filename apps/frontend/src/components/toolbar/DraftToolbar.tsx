import { Badge, Button, Chip, Dropdown, Tooltip } from '@heroui/react'
import { BookmarkIcon, CheckIcon, HeartIcon, LanguagesIcon, PauseCircleIcon, PlayCircleIcon, StopCircleIcon } from 'lucide-react'
import React, { memo, useState } from 'react'
import Icon from '../ui/Icon'
import ModalValidation from '../pannels/ModalValidation'
import { errorToast, successToast } from '@/actions/showToast'
import { useRouter } from 'next/navigation'
import { useDraftActions } from '@/hooks/useDraft'
import { languages } from '@/app/constants'
import type { DraftTranslation } from '@/lib/types'
import { useTranslations } from 'next-intl'

const DraftToolbar = ({
  likeCount,
  hasLiked,
  hasBookmarked,
  isEditMode,
  draftId,
  drawerOpened,
  commentCount,
  readerState,
  isUserTheDraftAuthor,
  onToggleLike,
  onToggleBookmark,
  onTranslateDocument,
  onReaderPlay,
  onReaderPause,
  onReaderStop,
  setIsEditMode,
  setDrawerOpened,
  viewingLanguage = 'en',
  savedTranslations = [],
  onSwitchLanguage,
}: {
  likeCount?: number,
  hasLiked?: boolean,
  hasBookmarked?: boolean,
  draftId: string,
  isEditMode: boolean,
  drawerOpened: boolean,
  commentCount?: number,
  readerState: 'idle' | 'loading' | 'playing' | 'paused',
  isUserTheDraftAuthor: boolean,
  onToggleLike: () => void,
  onToggleBookmark: () => void,
  onTranslateDocument?: (language: string) => Promise<void>,
  onReaderPlay: () => void,
  onReaderPause: () => void,
  onReaderStop: () => void,
  setIsEditMode: () => void,
  setDrawerOpened: () => void,
  viewingLanguage?: string,
  savedTranslations?: DraftTranslation[],
  onSwitchLanguage?: (langKey: string) => void,
}) => {
  const t = useTranslations('draftToolbar');
  const MemoButton = memo(Button);

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const onOpenChange = () => setIsOpen(v => !v);
  const { deleteDraft } = useDraftActions();

  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslateDocument = async (language: string) => {
    if (!onTranslateDocument) return;
    setIsTranslating(true);
    try {
      await onTranslateDocument(language);
      successToast(t('translatedToast', { language }));
    } catch {
      errorToast(t('translateErrorToast'));
    } finally {
      setIsTranslating(false);
    }
  };

  const onDeleteDraft = async () => {
    setLoading(true);

    try {
      await deleteDraft(draftId);
      successToast(t('deletedToast'));
      router.back();
    } catch {
      errorToast(t('deleteErrorToast'))
    } finally {
      setLoading(false);
      onOpenChange();
    }
  }

  return (
    <div className="w-full h-14 flex mx-auto px-4 md:px-0 py-2 items-center justify-between border-b border-divider z-2 bg-content1">
      <div className="w-full flex items-center gap-3 flex-1">
        <Badge.Anchor>
          <Tooltip delay={500}>
            <Tooltip.Trigger>
              <Button isIconOnly variant={"ghost"} onPress={onToggleLike}>
                <HeartIcon  fill={hasLiked ? "#006FEE" : "none"} strokeWidth={hasLiked ? 0 : undefined} className="text-foreground-500 transition-all duration-500" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="bottom">{t('like')}</Tooltip.Content>
          </Tooltip>

          {(likeCount ?? 0) > 0 && <Badge color="danger" size='sm'>{String(likeCount)}</Badge>}
        </Badge.Anchor>

        <Tooltip delay={500}>
          <Tooltip.Trigger>
            <Button isIconOnly variant="ghost" onPress={onToggleBookmark}>
              <BookmarkIcon
                className={`transition-all duration-300 ${hasBookmarked ? 'text-primary' : 'text-foreground-500'}`}
                fill={hasBookmarked ? 'currentColor' : 'none'}
                size={18}
              />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content placement="bottom">{hasBookmarked ? t('removeBookmark') : t('bookmark')}</Tooltip.Content>
        </Tooltip>

        <Badge.Anchor>
          <Tooltip delay={500}>
            <Tooltip.Trigger>
              <Button isIconOnly size={"sm"} variant={"ghost"} onPress={setDrawerOpened}>
                <Icon name="MessageCircleMore" className={drawerOpened ? 'text-primary-500' : "text-foreground-500"} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{t('comments')}</Tooltip.Content>
          </Tooltip>

          {(commentCount ?? 0) > 0 && <Badge color="accent" size='sm'>{String(commentCount)}</Badge>}
        </Badge.Anchor>
      </div>

      <div className="flex items-center gap-1">
        {!isEditMode && <>
          <Tooltip delay={500}>
            <Tooltip.Trigger>
              <MemoButton
                variant="ghost"
                size="sm"
                isIconOnly
                isPending={readerState === 'loading'}
                isDisabled={readerState === 'loading'}
                onPress={readerState === 'playing' ? onReaderPause : onReaderPlay}
              >
                {readerState === 'playing'
                  ? <PauseCircleIcon className="text-primary-500" size={18} />
                  : <PlayCircleIcon className="text-foreground-500" size={18} />
                }
              </MemoButton>
            </Tooltip.Trigger>
            <Tooltip.Content>{readerState === 'playing' ? t('pause') : t('readAloud')}</Tooltip.Content>
          </Tooltip>

          {(readerState === 'playing' || readerState === 'paused') &&
            <Tooltip delay={500}>
              <Tooltip.Trigger>
                <MemoButton variant="ghost" size="sm" isIconOnly onPress={onReaderStop}>
                  <StopCircleIcon className="text-foreground-500" size={18} />
                </MemoButton>
              </Tooltip.Trigger>
              <Tooltip.Content placement="bottom">{t('stop')}</Tooltip.Content>
            </Tooltip>
          }

          {/* Language switcher */}
          {(savedTranslations.length > 0 || viewingLanguage !== 'original') && onSwitchLanguage &&
            <Dropdown>
              <Dropdown.Trigger>
                <Chip
                  size="sm"
                  variant={viewingLanguage !== 'original' ? 'primary' : 'soft'}
                  className="h-5 min-w-0 px-1 text-[10px] cursor-pointer"
                >
                  {viewingLanguage === 'original' ? t('original') : viewingLanguage.toUpperCase()}
                </Chip>
              </Dropdown.Trigger>

              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu
                  aria-label={t('switchLanguage')}
                  onAction={(key) => onSwitchLanguage!(String(key))}
                >
                  {[
                    { key: 'original', label: t('original') },
                    ...savedTranslations.map((t) => ({
                      key: t.language,
                      label: languages.find((l) => l.key === t.language)?.title ?? t.language,
                    })),
                  ].map((item) => (
                    <Dropdown.Item
                      key={item.key}
                      id={item.key}
                      textValue={item.label}
                      className={viewingLanguage === item.key ? 'text-primary' : ''}
                    >
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          }

          {onTranslateDocument &&
            <Dropdown>
              <Tooltip delay={500}>
                <Tooltip.Trigger>
                  <Dropdown.Trigger>
                    <MemoButton variant="ghost" size="sm" isIconOnly isPending={isTranslating} aria-label={t('translate')}>
                      <LanguagesIcon className="text-foreground-500" size={18} />
                    </MemoButton>
                  </Dropdown.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Content>{t('translate')}</Tooltip.Content>
              </Tooltip>

              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu>
                  {languages.map((lang) => {
                    const hasTranslation = savedTranslations.some(t => t.language === lang.key);
                    return (
                      <Dropdown.Item
                        key={lang.key}
                        id={lang.key}
                        textValue={lang.title}
                        onAction={() => handleTranslateDocument(lang.title)}
                        className={hasTranslation ? 'text-foreground-500' : ''}
                      >
                        <div className="flex items-center justify-between gap-4 w-full">
                          {lang.title}
                          {hasTranslation && <CheckIcon size={14} className="text-accent shrink-0" />}
                        </div>
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          }
        </>}

        {isUserTheDraftAuthor &&
          <Tooltip delay={500}>
            <Tooltip.Trigger>
              <MemoButton variant="ghost" size="sm" onPress={setIsEditMode} isIconOnly>
                <Icon name={isEditMode ? 'Eye' : 'Pencil'} className="text-foreground-500" />
              </MemoButton>
            </Tooltip.Trigger>
            <Tooltip.Content>{isEditMode ? t('preview') : t('edit')}</Tooltip.Content>
          </Tooltip>
        }

        {isUserTheDraftAuthor &&
          <Tooltip delay={500}>
            <Tooltip.Trigger>
              <MemoButton variant="ghost" size="sm" onPress={onOpenChange} isIconOnly>
                <Icon name="Trash2" className="text-danger" />
              </MemoButton>
            </Tooltip.Trigger>
            <Tooltip.Content>{t('deleteDraft')}</Tooltip.Content>
          </Tooltip>
        }
      </div>

      <ModalValidation
        size="lg"
        isOpen={isOpen}
        cancelText={t('cancel')}
        title={t('deleteDraft')}
        validateText={t('delete')}
        validateLoading={loading}
        body={t('deleteConfirmBody')}
        onCancel={onOpenChange}
        onOpenChange={onOpenChange}
        onValidate={onDeleteDraft}
      />
    </div>
  )
}

export default DraftToolbar
