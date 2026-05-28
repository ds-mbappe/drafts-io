'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthFetcher } from './useAuthFetcher'
import { backendUrl } from '@/lib/backend'
import type { AppNotification, NotificationPreferences } from '@/lib/types'

const PAGE_SIZE = 10

export function useNotifications() {
  const { fetcher, token } = useAuthFetcher()

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)

  const esRef = useRef<EventSource | null>(null)
  const tokenRef = useRef(token)
  tokenRef.current = token

  // ── Initial load ──────────────────────────────────────────────────────────

  const loadInitial = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetcher(`/api/notifications?take=${PAGE_SIZE}`)
      setNotifications(res.notifications)
      setNextCursor(res.nextCursor)
      setHasMore(!!res.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [token, fetcher])

  // ── Infinite scroll ───────────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading) return
    setLoading(true)
    try {
      const res = await fetcher(`/api/notifications?take=${PAGE_SIZE}&cursor=${nextCursor}`)
      setNotifications((prev) => [...prev, ...res.notifications])
      setNextCursor(res.nextCursor)
      setHasMore(!!res.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [nextCursor, loading, fetcher])

  // ── SSE connection ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return

    const es = new EventSource(backendUrl(`/api/notifications/stream?token=${token}`))
    esRef.current = es

    es.addEventListener('notification', (e) => {
      const notification: AppNotification = JSON.parse(e.data)
      setNotifications((prev) => [notification, ...prev])
    })

    es.addEventListener('unread_count', (e) => {
      const { count } = JSON.parse(e.data)
      setUnreadCount(count)
    })

    es.onerror = () => {
      es.close()
      // Reconnect after 5 s if the connection drops
      setTimeout(() => {
        if (tokenRef.current) {
          esRef.current = new EventSource(
            backendUrl(`/api/notifications/stream?token=${tokenRef.current}`)
          )
        }
      }, 5000)
    }

    loadInitial()

    return () => {
      es.close()
      esRef.current = null
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    await fetcher(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
  }, [fetcher])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    await fetcher('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
  }, [fetcher])

  const deleteNotification = useCallback(async (id: string) => {
    const wasUnread = notifications.find((n) => n.id === id)?.read === false
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1))
    await fetcher(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => {})
  }, [notifications, fetcher])

  const deleteAll = useCallback(async () => {
    setNotifications([])
    setUnreadCount(0)
    setNextCursor(null)
    setHasMore(false)
    await fetcher('/api/notifications', { method: 'DELETE' }).catch(() => {})
  }, [fetcher])

  // ── Preferences ───────────────────────────────────────────────────────────

  const getPreferences = useCallback(() => {
    return fetcher('/api/notifications/preferences') as Promise<NotificationPreferences>
  }, [fetcher])

  const updatePreferences = useCallback((data: Partial<NotificationPreferences>) => {
    return fetcher('/api/notifications/preferences', { method: 'PATCH', body: data }) as Promise<NotificationPreferences>
  }, [fetcher])

  return {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadMore,
    markRead,
    markAllRead,
    deleteNotification,
    deleteAll,
    getPreferences,
    updatePreferences,
  }
}
