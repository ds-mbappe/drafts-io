'use client'

import { Avatar, Button } from '@heroui/react'
import { Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { AppNotification } from '@/lib/types'

interface NotificationItemProps {
  notification: AppNotification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}

function actorName(actor: AppNotification['actor']) {
  return [actor.firstname, actor.lastname].filter(Boolean).join(' ') || actor.username || 'Someone'
}

export const NotificationItem = ({ notification, onRead, onDelete }: NotificationItemProps) => {
  const t = useTranslations('notifications')
  const router = useRouter()

  const { id, type, read, actor, draft, createdAt } = notification
  const name = actorName(actor)

  const text =
    type === 'FOLLOW'
      ? t('follow', { actor: name })
      : type === 'LIKE'
        ? t('like', { actor: name, title: draft?.title ?? '' })
        : t('comment', { actor: name, title: draft?.title ?? '' })

  const href =
    type === 'FOLLOW'
      ? `/app/profile/${actor.username ?? actor.id}`
      : `/app/drafts/${draft?.id}`

  const handleClick = () => {
    if (!read) onRead(id)
    router.push(href)
  }

  return (
    <div
      className={`group flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-content2 ${!read ? 'bg-primary-50/60 dark:bg-primary-900/10' : ''}`}
      onClick={handleClick}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0 w-2">
        {!read && <span className="block w-2 h-2 rounded-full bg-primary" />}
      </div>

      <Avatar size="sm" color="accent">
        <Avatar.Image src={actor.avatar ?? ''} />
        <Avatar.Fallback>{(actor.firstname ?? actor.username ?? '?')[0]?.toUpperCase()}</Avatar.Fallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-700 dark:text-foreground-300 leading-snug">{text}</p>
        <p className="text-xs text-foreground-400 mt-0.5">
          {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      </div>

      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 shrink-0"
        onPress={(e) => { (e as any).stopPropagation?.(); onDelete(id) }}
        onClick={(e) => e.stopPropagation()}
        aria-label={t('delete')}
      >
        <Trash2Icon size={13} className="text-foreground-400" />
      </Button>
    </div>
  )
}
