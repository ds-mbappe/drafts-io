'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Button } from '@heroui/react'
import { BellIcon, CheckCheckIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationItem } from '@/components/notifications/NotificationItem'

export default function NotificationsPage() {
  const t = useTranslations('notifications')
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadMore,
    markRead,
    markAllRead,
    deleteNotification,
    deleteAll,
  } = useNotifications()

  const observer = useRef<IntersectionObserver | null>(null)
  const sentinelCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting && hasMore && !loading) loadMore()
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    observer.current?.disconnect()
    if (!sentinelRef.current) return
    observer.current = new IntersectionObserver(sentinelCallback, { threshold: 0.1 })
    observer.current.observe(sentinelRef.current)
    return () => observer.current?.disconnect()
  }, [sentinelCallback])

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onPress={markAllRead} className="text-foreground-500">
              <CheckCheckIcon size={15} />
              {t('markAllRead')}
            </Button>
          )}
          {notifications.length > 0 && (
            <Button size="sm" variant="ghost" onPress={deleteAll} className="text-foreground-500">
              <Trash2Icon size={15} />
              {t('deleteAll')}
            </Button>
          )}
          <Link
            href="/app/settings"
            className="text-xs text-foreground-400 hover:text-foreground transition-colors"
          >
            {t('settings')}
          </Link>
        </div>
      </div>

      {/* List */}
      {notifications.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <BellIcon size={40} className="text-foreground-300" />
          <p className="text-base font-medium text-foreground-500">{t('noNotifications')}</p>
          <p className="text-sm text-foreground-400 max-w-xs">{t('noNotificationsDescription')}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-divider overflow-hidden divide-y divide-divider">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={markRead}
              onDelete={deleteNotification}
            />
          ))}
          <div ref={sentinelRef} className="h-1" />
          {loading && (
            <p className="text-xs text-foreground-400 text-center py-3">{'…'}</p>
          )}
        </div>
      )}
    </div>
  )
}
