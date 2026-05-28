'use client'

import { useCallback, useEffect, useState } from 'react'
import { useComments } from 'tiptop-editor'
import type { TiptopComment, TiptopEditorHandle } from 'tiptop-editor'
import { Avatar, Button, TextArea, Tooltip } from '@heroui/react'
import { PencilIcon, Trash2Icon, XIcon, CheckIcon } from 'lucide-react'
import type { BaseUser } from '@/lib/types'
import { errorToast } from '@/actions/showToast'
import { useTranslations } from 'next-intl'

interface CommentDrawerContentProps {
  editorRef: React.RefObject<TiptopEditorHandle | null>
  fetcher: (url: string, options: any) => Promise<any>
  draftId: string
  currentUser: BaseUser
  isAuthor: boolean
  onOpen: () => void
}

export const CommentDrawerContent = ({
  editorRef,
  fetcher,
  draftId,
  currentUser,
  isAuthor,
  onOpen,
}: CommentDrawerContentProps) => {
  const t = useTranslations('comments')
  const ctx = useComments()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const authorName = [currentUser?.firstname, currentUser?.lastname]
    .filter(Boolean)
    .join(' ') || 'Anonymous'

  useEffect(() => {
    if (ctx?.activeCommentId) onOpen()
  }, [ctx?.activeCommentId])

  const handleSubmit = useCallback(async () => {
    if (!ctx?.pendingComment || !text.trim()) return
    const editor = editorRef.current?.getEditor()
    if (!editor) return

    const { pendingComment } = ctx
    setSubmitting(true)

    try {
      if (pendingComment.type === 'inline') {
        editor.commands.setComment(pendingComment.id, {
          from: pendingComment.from,
          to: pendingComment.to,
        })
      }

      ctx.addComment(pendingComment.id, pendingComment.type, text.trim(), authorName)

      await fetcher('/api/comments', {
        method: 'POST',
        body: {
          id: pendingComment.id,
          draftId,
          text: text.trim(),
          from: pendingComment.type === 'inline' ? pendingComment.from : 0,
          to: pendingComment.type === 'inline' ? pendingComment.to : 0,
        },
      })

      setText('')
    } catch {
      errorToast(t('failedToSave'))
    } finally {
      setSubmitting(false)
    }
  }, [ctx, text, editorRef, fetcher, draftId, authorName])

  const handleCancel = useCallback(() => {
    ctx?.setPendingComment(null)
    setText('')
  }, [ctx])

  const handleEditStart = useCallback((comment: TiptopComment) => {
    setEditingId(comment.id)
    setEditText(comment.content)
  }, [])

  const handleEditSave = useCallback(async (comment: TiptopComment) => {
    if (!ctx || !editText.trim()) return
    setSubmitting(true)
    try {
      await fetcher(`/api/comments/${comment.id}`, {
        method: 'PUT',
        body: { text: editText.trim() },
      })
      ctx.removeComment(comment.id)
      ctx.addComment(comment.id, comment.type, editText.trim(), comment.author)
      setEditingId(null)
    } catch {
      errorToast(t('failedToUpdate'))
    } finally {
      setSubmitting(false)
    }
  }, [ctx, fetcher, editText])

  const handleEditCancel = useCallback(() => {
    setEditingId(null)
    setEditText('')
  }, [])

  const handleRemove = useCallback(async (comment: TiptopComment) => {
    const editor = editorRef.current?.getEditor()
    if (!editor || !ctx) return
    if (comment.type === 'inline') editor.commands.unsetComment(comment.id)
    ctx.removeComment(comment.id)
    await fetcher(`/api/comments/${comment.id}`, { method: 'DELETE' }).catch(() => {})
  }, [ctx, editorRef, fetcher])

  if (!ctx) return null

  const { comments, pendingComment, activeCommentId } = ctx
  const activeComments = comments.filter((c) => !c.resolved)

  return (
    <div className="flex flex-col gap-3 p-4">

      {pendingComment && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-content2 border border-divider">
          <div className="flex items-center gap-2">
            <Avatar size="sm" color="accent">
              <Avatar.Image src={currentUser?.avatar ?? ''} />
              <Avatar.Fallback>{currentUser?.firstname?.[0]}</Avatar.Fallback>
            </Avatar>
            <span className="text-sm font-medium">{authorName}</span>
          </div>

          <TextArea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('addCommentPlaceholder')}
            rows={2}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onPress={handleCancel}>{t('cancel')}</Button>
            <Button size="sm" variant="primary" isDisabled={!text.trim()} isPending={submitting} onPress={handleSubmit}>
              {t('comment')}
            </Button>
          </div>
        </div>
      )}

      {activeComments.length === 0 && !pendingComment && (
        <p className="text-sm text-foreground-400 text-center py-6">{t('noCommentsYet')}</p>
      )}

      {activeComments.map((comment) => (
        <div
          key={comment.id}
          className={`flex flex-col gap-2 p-3 rounded-xl transition-colors border ${
            activeCommentId === comment.id
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
              : 'bg-content2 border-transparent hover:border-divider'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar size="sm" color="accent">
                <Avatar.Fallback>{comment.author?.[0]}</Avatar.Fallback>
              </Avatar>
              <span className="text-sm font-medium truncate">{comment.author ?? 'Anonymous'}</span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              {editingId === comment.id ? (
                <>
                  <Tooltip delay={500}>
                    <Tooltip.Trigger>
                      <Button isIconOnly size="sm" variant="ghost" isPending={submitting} onPress={() => handleEditSave(comment)}>
                        <CheckIcon size={14} className="text-green-500" />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content placement="bottom">{t('save')}</Tooltip.Content>
                  </Tooltip>
                  <Tooltip delay={500}>
                    <Tooltip.Trigger>
                      <Button isIconOnly size="sm" variant="ghost" onPress={handleEditCancel}>
                        <XIcon size={14} className="text-foreground-500" />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content placement="bottom">{t('cancel')}</Tooltip.Content>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip delay={500}>
                    <Tooltip.Trigger>
                      <Button isIconOnly size="sm" variant="ghost" onPress={() => handleEditStart(comment)}>
                        <PencilIcon size={14} className="text-foreground-500" />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content placement="bottom">{t('edit')}</Tooltip.Content>
                  </Tooltip>
                  {isAuthor && (
                    <Tooltip delay={500}>
                      <Tooltip.Trigger>
                        <Button isIconOnly size="sm" variant="ghost" onPress={() => handleRemove(comment)}>
                          <Trash2Icon size={14} className="text-red-500" />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content placement="bottom">{t('delete')}</Tooltip.Content>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>

          {editingId === comment.id ? (
            <TextArea
              autoFocus
              value={editText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)}
              rows={2}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleEditSave(comment)
                if (e.key === 'Escape') handleEditCancel()
              }}
            />
          ) : (
            <>
              <p className="text-sm text-foreground-700 dark:text-foreground-300 whitespace-pre-wrap">
                {comment.content}
              </p>
              <span className="text-xs text-foreground-400">
                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
