'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { BellIcon, CheckCheckIcon, SettingsIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationItem } from './NotificationItem'

export const NotificationBell = () => {
  const t = useTranslations('notifications')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Infinite scroll sentinel
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

  const cappedCount = unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null

  return (
    <div ref={ref} className="relative">
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        onPress={() => setOpen((v) => !v)}
        aria-label={t('title')}
        className="relative"
      >
        <BellIcon size={18} />
        {cappedCount && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center leading-none">
            {cappedCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] rounded-xl border border-divider bg-background shadow-lg z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-divider">
            <span className="text-sm font-semibold">{t('title')}</span>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && unreadCount > 0 && (
                <Button isIconOnly size="sm" variant="ghost" onPress={markAllRead} aria-label={t('markAllRead')}>
                  <CheckCheckIcon size={15} className="text-foreground-500" />
                </Button>
              )}
              {notifications.length > 0 && (
                <Button isIconOnly size="sm" variant="ghost" onPress={deleteAll} aria-label={t('deleteAll')}>
                  <Trash2Icon size={15} className="text-foreground-500" />
                </Button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[380px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
                <BellIcon size={28} className="text-foreground-300" />
                <p className="text-sm font-medium text-foreground-500">{t('noNotifications')}</p>
                <p className="text-xs text-foreground-400">{t('noNotificationsDescription')}</p>
              </div>
            ) : (
              <>
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markRead}
                    onDelete={deleteNotification}
                  />
                ))}
                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-1" />
                {loading && (
                  <p className="text-xs text-foreground-400 text-center py-2">{'…'}</p>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-divider">
            <Link
              href="/app/notifications"
              className="text-xs text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              {t('openPage')}
            </Link>
            <Link
              href="/app/settings"
              className="flex items-center gap-1 text-xs text-foreground-400 hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              <SettingsIcon size={12} />
              {t('settings')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
