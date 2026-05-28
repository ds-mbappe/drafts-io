'use server'

import { backendUrl } from '@/lib/backend'
import { BaseUser } from '@/lib/types'

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

const flattenStats = (raw: any): BaseUser => ({
  ...raw,
  followers: raw.stats?.followers ?? 0,
  following: raw.stats?.following ?? 0,
  publishedDrafts: raw.stats?.publishedDrafts ?? 0,
  totalLikes: raw.stats?.totalLikes ?? 0,
})

export const getMyProfile = async (token: string): Promise<BaseUser | null> => {
  const res = await fetch(backendUrl('/api/user/me/profile'), {
    headers: authHeaders(token),
  })
  if (!res.ok) return null
  return flattenStats(await res.json())
}

export const getUserProfile = async (token: string, username: string): Promise<BaseUser | null> => {
  const res = await fetch(backendUrl(`/api/user/${encodeURIComponent(username)}/profile`), {
    headers: authHeaders(token),
  })
  if (!res.ok) return null
  return flattenStats(await res.json())
}

export const getDraftsByUsername = async (
  token: string,
  username: string,
  cursor?: string,
): Promise<{ items: any[]; nextCursor: string | null }> => {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  const res = await fetch(
    backendUrl(`/api/drafts/user/${encodeURIComponent(username)}${params.size ? `?${params}` : ''}`),
    { headers: authHeaders(token) },
  )
  if (!res.ok) return { items: [], nextCursor: null }
  return res.json()
}
