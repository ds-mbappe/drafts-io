'use client'

import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useAuthFetcher } from './useAuthFetcher'
import { BaseUser, DraftPagination } from '@/lib/types'

const flattenStats = (raw: any): BaseUser => ({
  ...raw,
  followers: raw.stats?.followers ?? 0,
  following: raw.stats?.following ?? 0,
  publishedDrafts: raw.stats?.publishedDrafts ?? 0,
  totalLikes: raw.stats?.totalLikes ?? 0,
})

export const useUserProfile = (username: string | null) => {
  const { fetcher } = useAuthFetcher()

  const fetchProfile = async (url: string) => flattenStats(await fetcher(url))

  const { data, error, isLoading, mutate } = useSWR<BaseUser>(
    username ? `/api/user/${encodeURIComponent(username)}/profile` : null,
    fetchProfile,
    { revalidateOnFocus: false },
  )

  return { profile: data ?? null, isLoading, error, mutate }
}

export const useInfiniteUserDrafts = (username: string | null) => {
  const { fetcher } = useAuthFetcher()

  const getKey = (pageIndex: number, previousData: DraftPagination | null) => {
    if (!username) return null
    if (pageIndex > 0 && !previousData?.nextCursor) return null
    const params = new URLSearchParams()
    if (pageIndex > 0 && previousData?.nextCursor) params.set('cursor', previousData.nextCursor)
    const qs = params.toString()
    return qs
      ? `/api/drafts/user/${encodeURIComponent(username)}?${qs}`
      : `/api/drafts/user/${encodeURIComponent(username)}`
  }

  const { data, setSize, isLoading, isValidating, mutate } = useSWRInfinite<DraftPagination>(
    getKey,
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false },
  )

  const items = data?.flatMap((p) => p.items ?? []) ?? []
  const hasMore = !!data?.[data.length - 1]?.nextCursor

  return { items, hasMore, loadMore: () => setSize((s) => s + 1), isLoading, isValidating, mutate }
}
