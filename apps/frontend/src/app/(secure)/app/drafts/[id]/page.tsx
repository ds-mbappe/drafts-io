"use client"

import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation'
import { Button } from '@heroui/react';
import { useDraftActions, useGetDraft } from '@/hooks/useDraft';
import { NextSessionContext } from '@/contexts/SessionContext';
import { useDebouncedCallback } from 'use-debounce';
import { errorToast, infoToast, successToast } from '@/actions/showToast';
import ModalValidation from '@/components/pannels/ModalValidation';
import { CharacterCount, CommentCardProps, DraftProps, DraftTranslation } from '@/lib/types';
import DraftToolbar from '@/components/toolbar/DraftToolbar';
import { useAuthFetcher } from '@/hooks/useAuthFetcher';
import { useComments as useBackendComments } from '@/hooks/useComments';
import { useBlockEditor } from '@/components/editor/hooks/useBlockEditor';
import { TiptopEditor, TiptopEditorHandle, CommentsProvider, TiptopComment, useComments } from 'tiptop-editor';
import ButtonAiTools from '@/components/ui/ButtonAiTools';
import { translateDocument } from '@/lib/editor';
import { useReader } from '@/hooks/useReader';
import { getTranslations, saveTranslation } from '@/actions/translation';
import { languages } from '@/app/constants';
import { CustomDrawer } from '@/components/pannels/CustomDrawer';
import { CommentDrawerContent } from '@/components/pannels/CommentDrawerContent';
import { DraftPageFallback } from '@/components/suspense/DraftPageFallback'
import DraftAuthorCard from '@/components/draft/DraftAuthorCard'
import { useTranslations } from 'next-intl';

/**
 * Collect all imageUploader nodes from a doc in document order.
 */
function collectImages(node: Record<string, any>): Record<string, any>[] {
  const images: Record<string, any>[] = [];
  if (node.type === 'imageUploader') images.push(node);
  for (const child of node.content ?? []) images.push(...collectImages(child));
  return images;
}

/**
 * Walk `content` and replace each imageUploader (in order) with the
 * corresponding one from `originals`. Images are language-independent so they
 * must always come from the original draft content, not the translation.
 */
function restoreImages(
  node: Record<string, any>,
  originals: Record<string, any>[],
  counter = { i: 0 },
): Record<string, any> {
  if (node.type === 'imageUploader') {
    return originals[counter.i++] ?? node;
  }
  if (!node.content) return node;
  return {
    ...node,
    content: node.content.map((c: Record<string, any>) =>
      restoreImages(c, originals, counter),
    ),
  };
}

// Renders nothing — exists only to watch CommentsContext from inside
// CommentsProvider and open the drawer whenever a pending comment is set
// (bubble menu click) or a highlighted comment is clicked in the editor.
function CommentAutoOpen({ isOpen, onOpen, onCountChange }: { isOpen: boolean; onOpen: () => void; onCountChange: (n: number) => void }) {
  const ctx = useComments()

  useEffect(() => {
    if (ctx?.pendingComment) onOpen()
  }, [ctx?.pendingComment]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ctx?.activeCommentId) onOpen()
  }, [ctx?.activeCommentId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onCountChange(ctx?.comments.filter(c => !c.resolved).length ?? 0)
  }, [ctx?.comments]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear the active comment selection when the drawer is closed.
  useEffect(() => {
    if (!isOpen) ctx?.setActiveCommentId(null)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default function Page() {
  const t = useTranslations('draftPage');
  const tComments = useTranslations('comments');
  const params = useParams();
  const { id } = params;
  const { fetcher } = useAuthFetcher();
  const { toggleDraftLike, toggleBookmark, recordView } = useDraftActions();
  const draftId = id?.toString() || '';
  const { session } = useContext(NextSessionContext);
  const userID = session?.user?.id;

  const editorRef = useRef<TiptopEditorHandle>(null);

  const [isOpen, setIsOpen] = useState(false);
  const onOpenChange = () => setIsOpen(v => !v);

  const MemoButton = memo(Button);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [viewingLanguage, setViewingLanguage] = useState<string>('original');
  const [savedTranslations, setSavedTranslations] = useState<DraftTranslation[]>([]);
  // Ref so handleDebouncedUpdates never has a stale viewingLanguage value.
  const viewingLanguageRef = useRef<string>('original');
  // Snapshot of the original content captured at mount — never overwritten by translations.
  const originalContentRef = useRef<Record<string, any> | null>(null);

  // For TTS, pass the translation language when viewing one; fall back to 'en'
  // for the original (we don't store the original language — auto-detection is a future task).
  const ttsLanguage = viewingLanguage === 'original' ? 'en' : viewingLanguage;
  const { readerState, play: readerPlay, pause: readerPause, stop: readerStop } = useReader(
    editorRef, fetcher, draftId, ttsLanguage,
  );

  const { draft, mutate: mutateDoc } = useGetDraft(draftId);

  // Load existing comments from the backend to pre-populate CommentsProvider.
  // Only used for initialisation — all subsequent state is managed by tiptop.
  const { comments: backendComments } = useBackendComments(draftId);

  const [doc, setDoc] = useState<DraftProps>(() => {
    return {
      id: draft?.id,
      content: draft?.content,
      cover: draft?.cover,
      title: draft?.title,
      intro: draft?.intro,
      author: draft?.author,
      private: draft?.private,
      createdAt: draft?.createdAt,
      topics: draft?.topics,
      locked: draft?.locked,
      updatedAt: draft?.updatedAt,
      word_count: draft?.word_count,
      character_count: draft?.character_count,
      hasLiked: draft?.hasLiked,
      _count: draft?._count,
    } as DraftProps;
  });

  const isUserTheDraftAuthor = useMemo(() => {
    return doc?.author?.id === userID;
  }, [doc.author?.id, userID]);

  const canEditDraft = useMemo(() => {
    return draft?.author?.id === userID && isEditMode;
  }, [draft?.author?.id, isEditMode, userID]);

  // Convert backend Comment records to the TiptopComment shape for initialisation.
  const initialComments = useMemo((): TiptopComment[] => {
    return (backendComments ?? [])
      .filter((c: CommentCardProps) => !!c.id && !!c.createdAt)
      .map((c: CommentCardProps) => ({
        id: c.id as string,
        type: 'inline' as const,
        content: c.text ?? '',
        author: c.user
          ? [c.user.firstname, c.user.lastname].filter(Boolean).join(' ')
          : undefined,
        createdAt: new Date(c.createdAt as string),
        replies: [],
        resolved: false,
      }));
  }, [backendComments]);

  const onPublishDraft = async () => {
    setLoading(true);
    await mutateDoc(
      async (currentData?: DraftProps) => {
        if (currentData) {
          const formData = { private: false };
          await fetcher(`/api/drafts/${draftId}`, { method: 'PUT', body: formData });
          return { ...currentData, private: false };
        }
      },
      {
        optimisticData: { ...(draft as DraftProps), private: false },
        rollbackOnError: true,
        revalidate: false,
      }
    );
    setLoading(false);
    successToast(t('publishedToast'))
    onOpenChange();
  }

  const onToggleBookmark = useDebouncedCallback(async () => {
    const willBookmark = !draft?.hasBookmarked;
    try {
      await mutateDoc(
        (prev: DraftProps | undefined) => {
          if (!prev) return prev;
          return { ...prev, hasBookmarked: willBookmark } as DraftProps;
        },
        { revalidate: false, rollbackOnError: true },
      );
      await toggleBookmark(draftId);
      infoToast(willBookmark ? t('bookmarkedToast') : t('unbookmarkedToast'));
    } catch {
      errorToast(t('errorToast'));
    } finally {
      mutateDoc();
    }
  }, 300);

  const onToggleLike = useDebouncedCallback(async () => {
    try {
      await mutateDoc(
        (prev: DraftProps | undefined) => {
          if (!prev) return prev as DraftProps | undefined;

          const prevLikeCount = prev._count?.likes ?? 0;
          const nextHasLiked = !prev.hasLiked;

          return {
            ...prev,
            hasLiked: nextHasLiked,
            _count: {
              ...(prev._count ?? {}),
              likes: nextHasLiked ? prevLikeCount + 1 : Math.max(0, prevLikeCount - 1),
            },
          } as DraftProps;
        },
        { revalidate: false, rollbackOnError: true },
      );

      await toggleDraftLike(draftId);

      infoToast(!draft?.hasLiked ? t('likedToast') : t('dislikedToast'))
    } catch {
      errorToast(t('errorToast'));
    } finally {
      mutateDoc();
    }
  }, 300);

  const onDebouncedUpdates = useDebouncedCallback(async (
    updatedContent: Record<string, any> | null,
    characterCount: CharacterCount,
    ydocBase64?: string,
  ) => {
    await mutateDoc(
      async (currentData: any) => {
        const formData: Record<string, any> = {
          content: updatedContent,
          word_count: characterCount?.words,
          character_count: characterCount?.characters,
        }

        if (ydocBase64) {
          formData.ydoc = ydocBase64;
        }

        await fetcher(`/api/drafts/${draftId}`, { method: 'PUT', body: formData });

        return { ...currentData, content: updatedContent };
      },
      {
        optimisticData: { ...(draft as DraftProps), content: updatedContent },
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }, 1000);

  // Keep the ref in sync so the debounced callback always sees the latest value.
  useEffect(() => { viewingLanguageRef.current = viewingLanguage; }, [viewingLanguage]);

  // Capture original content once when the draft first loads — never overwrite this.
  useEffect(() => {
    if (draft?.content && originalContentRef.current === null) {
      originalContentRef.current = draft.content;
    }
  }, [draft?.content]);

  // Load any translations this user has already saved for this draft.
  useEffect(() => {
    if (!draftId) return;
    getTranslations(draftId).then(setSavedTranslations);
  }, [draftId]);

  const handleDebouncedUpdates = useCallback(
    ({ updatedDoc, characterCount, ydocBase64 }: { updatedDoc: DraftProps; characterCount: CharacterCount; ydocBase64?: string }) => {
      // Never auto-save translated content back to the original draft.
      if (viewingLanguageRef.current !== 'original') return;
      onDebouncedUpdates(updatedDoc?.content, characterCount, ydocBase64);
    },
    [onDebouncedUpdates]
  );

  const { editorOptions } = useBlockEditor({
    doc,
    editorRef,
    autoFocus: false,
    editable: canEditDraft,
    debouncedUpdates: handleDebouncedUpdates,
    showCommentMenu: true,
    showReaderHighlight: true,
  });

  const handleTranslateDocument = useCallback(async (languageTitle: string) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    const langObj = languages.find((l) => l.title === languageTitle);
    const langKey = langObj?.key ?? 'en';

    // Block auto-save BEFORE the editor content changes — if we wait until after
    // translateDocument returns, the debounced update is already scheduled with
    // the translated content and will overwrite the original draft.
    viewingLanguageRef.current = langKey;
    setViewingLanguage(langKey);

    await translateDocument({ editor, language: languageTitle, fetcher });

    const rawTranslated = editor.getJSON() as Record<string, any>;
    const originalImages = collectImages(originalContentRef.current ?? draft?.content ?? {});
    const translatedContent = restoreImages(rawTranslated, originalImages);

    await saveTranslation(draftId, langKey, translatedContent);

    setSavedTranslations((prev) => [
      ...prev.filter((t) => t.language !== langKey),
      {
        language: langKey,
        content: translatedContent,
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, [fetcher, draftId]);

  const handleSwitchLanguage = useCallback((langKey: string) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    if (langKey === 'original') {
      editor.commands.setContent(originalContentRef.current ?? draft?.content ?? {});
      setViewingLanguage('original');
    } else {
      const translation = savedTranslations.find((t) => t.language === langKey);
      if (translation) {
        const originalImages = collectImages(originalContentRef.current ?? draft?.content ?? {});
        const content = restoreImages(translation.content as Record<string, any>, originalImages);
        editor.commands.setContent(content);
        setViewingLanguage(langKey);
      }
    }
  }, [draft?.content, savedTranslations]);

  useEffect(() => {
    if (draft?.id) {
      setDoc(draft)
    }
  }, [draft])

  useEffect(() => {
    if (draftId) recordView(draftId);
  }, [draftId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wait for both the draft and the comment list before mounting so that
  // CommentsProvider receives the correct initialComments on its first and
  // only mount — avoiding a key-driven remount that would wipe editor content.
  // Also wait for `doc` to be synced with `draft` so the editor's onCreate
  // sees the real content (the useState initializer runs with draft=undefined).
  if (!draft || backendComments === undefined || doc?.id !== draft.id) return <DraftPageFallback />

  return (
    <CommentsProvider initialComments={initialComments}>
      <CommentAutoOpen isOpen={commentsPanelOpen} onOpen={() => setCommentsPanelOpen(true)} onCountChange={setCommentCount} />
      <div className="w-full flex flex-col bg-content1 relative overflow-visible">
        <div className="sticky top-0 z-20">
          <DraftToolbar
            hasLiked={draft?.hasLiked}
            hasBookmarked={draft?.hasBookmarked}
            likeCount={draft?._count?.likes}
            draftId={draftId}
            isEditMode={isEditMode}
            drawerOpened={commentsPanelOpen}
            commentCount={commentCount}
            readerState={readerState}
            onToggleLike={onToggleLike}
            onToggleBookmark={onToggleBookmark}
            onTranslateDocument={handleTranslateDocument}
            onReaderPlay={readerPlay}
            onReaderPause={readerPause}
            onReaderStop={readerStop}
            isUserTheDraftAuthor={isUserTheDraftAuthor}
            setIsEditMode={() => setIsEditMode(!isEditMode)}
            setDrawerOpened={() => setCommentsPanelOpen(v => !v)}
            viewingLanguage={viewingLanguage}
            savedTranslations={savedTranslations}
            onSwitchLanguage={handleSwitchLanguage}
          />
        </div>

        {/* Main content row: editor + comment sidebar */}
        <div className="w-full flex flex-1 relative py-16">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {draft.author && (
              <div className=" max-w-3xl mx-auto w-full">
                <DraftAuthorCard author={draft.author} />
              </div>
            )}
            {draft.cover && (
              <div className="max-w-3xl mx-auto w-full px-5">
                <img
                  src={draft.cover}
                  alt={draft.title ?? ''}
                  className="w-full rounded-xl object-cover max-h-[480px]"
                />
              </div>
            )}
            <TiptopEditor
              ref={editorRef}
              className="px-5"
              editorOptions={{ ...editorOptions, commentMenuLabel: tComments('addComment') }}
              slots={{
                selectionMenuAppend(props) {
                  return <ButtonAiTools {...props} />
                },
              }}
            />
          </div>

          {!canEditDraft && (
            <CustomDrawer
              open={commentsPanelOpen}
              title={t('comments')}
              placement="right"
              onClose={() => setCommentsPanelOpen(false)}
            >
              <CommentDrawerContent
                editorRef={editorRef}
                fetcher={fetcher}
                draftId={draftId}
                currentUser={draft.author}
                isAuthor={isUserTheDraftAuthor}
                onOpen={() => setCommentsPanelOpen(true)}
              />
            </CustomDrawer>
          )}
        </div>

        {draft?.private &&
          <MemoButton
            variant="primary"
            aria-label={t('publishDraft')}
            className="fixed bottom-5 right-5 z-20"
            onPress={onOpenChange}
          >
            {t('publish')}
          </MemoButton>
        }

        <ModalValidation
          size="lg"
          isOpen={isOpen}
          cancelText={t('cancel')}
          validateText={t('publish')}
          title={t('publishDraft')}
          validateLoading={loading}
          body={t('publishConfirmBody')}
          onCancel={onOpenChange}
          onOpenChange={onOpenChange}
          onValidate={onPublishDraft}
        />
      </div>
    </CommentsProvider>
  )
}
