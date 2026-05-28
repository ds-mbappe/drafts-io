'use client'

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { DraftPagination, DraftProps } from '@/lib/types';
import { useAuthFetcher } from './useAuthFetcher';

const useDraftActions = () => {
  const { fetcher } = useAuthFetcher();

  const toggleDraftLike = async (draftId: string) => {
    return fetcher(`/api/drafts/${draftId}/toggle_like`, { method: 'POST' });
  };

  const updateDraft = async (draftId: string, formData?: Record<string, unknown>) => {
    return fetcher(`/api/drafts/${draftId}`, { method: 'PUT', body: formData ?? {} });
  };

  const deleteDraft = async (draftId: string) => {
    return fetcher(`/api/drafts/${draftId}`, { method: 'DELETE' });
  };

  const toggleBookmark = async (draftId: string) => {
    return fetcher(`/api/bookmarks/${draftId}/toggle`, { method: 'POST' });
  };

  const recordView = async (draftId: string) => {
    return fetcher(`/api/recently-read/${draftId}`, { method: 'POST' });
  };

  return { toggleDraftLike, updateDraft, deleteDraft, toggleBookmark, recordView };
};

const useGetDraft = (draftId: string | null) => {
  const { fetcher } = useAuthFetcher();

  const { data, error, isLoading, mutate } = useSWR<DraftProps>(
    draftId ? `/api/drafts/${draftId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  return { draft: data, isLoading, error, mutate };
};

// --- Infinite scroll helpers ---

const buildInfiniteKey = (
  baseUrl: string,
  pageIndex: number,
  previousData: DraftPagination | null,
  extraParams?: Record<string, string>,
) => {
  if (pageIndex > 0 && !previousData?.nextCursor) return null;
  const params = new URLSearchParams(extraParams);
  if (pageIndex > 0 && previousData?.nextCursor) params.set('cursor', previousData.nextCursor);
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
};

const useInfiniteDiscoverDrafts = (search?: string) => {
  const { fetcher } = useAuthFetcher();

  const { data, size: _size, setSize, isLoading, isValidating } = useSWRInfinite<DraftPagination>(
    (i, prev) => buildInfiniteKey('/api/drafts', i, prev, search ? { search } : undefined),
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const items = data?.flatMap((p) => p.items ?? []) ?? [];
  const hasMore = !!data?.[data.length - 1]?.nextCursor;

  return { items, hasMore, loadMore: () => setSize((s) => s + 1), isLoading, isValidating, mutate: undefined };
};

const useInfiniteFollowingDrafts = (search?: string) => {
  const { fetcher } = useAuthFetcher();

  const { data, size: _size, setSize, isLoading, isValidating } = useSWRInfinite<DraftPagination>(
    (i, prev) => buildInfiniteKey('/api/drafts/following', i, prev, search ? { search } : undefined),
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const items = data?.flatMap((p) => p.items ?? []) ?? [];
  const hasMore = !!data?.[data.length - 1]?.nextCursor;

  return { items, hasMore, loadMore: () => setSize((s) => s + 1), isLoading, isValidating };
};

const useInfiniteLibraryDrafts = (search?: string) => {
  const { fetcher } = useAuthFetcher();

  const { data, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<DraftPagination>(
    (i, prev) => buildInfiniteKey('/api/drafts/my_library', i, prev, search ? { search } : undefined),
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const items = data?.flatMap((p) => p.items ?? []) ?? [];
  const hasMore = !!data?.[data.length - 1]?.nextCursor;

  return { items, hasMore, loadMore: () => setSize((s) => s + 1), isLoading, isValidating, mutate };
};

const useInfiniteRecentlyRead = () => {
  const { fetcher } = useAuthFetcher();

  const { data, size: _size, setSize, isLoading, isValidating } = useSWRInfinite<DraftPagination>(
    (i, prev) => buildInfiniteKey('/api/recently-read', i, prev),
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const items = data?.flatMap((p) => p.items ?? []) ?? [];
  const hasMore = !!data?.[data.length - 1]?.nextCursor;

  return { items, hasMore, loadMore: () => setSize((s) => s + 1), isLoading, isValidating };
};

type TrendingPage = { items: DraftProps[]; hasMore: boolean; nextSkip: number };

const useTrending = (limit = 10) => {
  const { fetcher } = useAuthFetcher();
  const { data, error, isLoading } = useSWR<TrendingPage>(
    `/api/drafts/trending?limit=${limit}`,
    fetcher,
    { revalidateOnFocus: false },
  );
  return { data, isLoading, error };
};

const useInfiniteTrending = () => {
  const { fetcher } = useAuthFetcher();

  const { data, size: _size, setSize, isLoading, isValidating } = useSWRInfinite<TrendingPage>(
    (pageIndex, prev) => {
      if (pageIndex > 0 && !prev?.hasMore) return null;
      const skip = prev?.nextSkip ?? 0;
      return `/api/drafts/trending?limit=10&skip=${pageIndex === 0 ? 0 : skip}`;
    },
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const items = data?.flatMap((p) => p.items ?? []) ?? [];
  const hasMore = !!data?.[data.length - 1]?.hasMore;

  return { items, hasMore, loadMore: () => setSize((s) => s + 1), isLoading, isValidating };
};

const useTopics = () => {
  const { fetcher } = useAuthFetcher();

  const { data, error, isLoading } = useSWR<{ name: string; count: number }[]>(
    `/api/drafts/topics`,
    fetcher,
    { revalidateOnFocus: false },
  );

  return { data, isLoading, error };
};

const useDraftsByTopics = (topics: string[], search?: string) => {
  const { fetcher } = useAuthFetcher();

  const params = new URLSearchParams();
  topics.forEach((t) => params.append('topic', t));
  if (search) params.set('search', search);
  const query = params.toString();

  const { data, error, isLoading, mutate } = useSWR<DraftPagination>(
    query ? `/api/drafts?${query}` : `/api/drafts`,
    fetcher,
    { revalidateOnFocus: false },
  );

  return { data, isLoading, error, mutate };
};

const useSavedDrafts = () => {
  const { fetcher } = useAuthFetcher();

  const { data, error, isLoading, mutate } = useSWR<DraftProps[]>(
    `/api/bookmarks`,
    fetcher,
    { revalidateOnFocus: false },
  );

  return { data, isLoading, error, mutate };
};

// Keep old hooks for backward compatibility
const useFeedDiscoverDrafts = useInfiniteDiscoverDrafts;
const useFeedFollowingDrafts = useInfiniteFollowingDrafts;
const useLibraryDrafts = useInfiniteLibraryDrafts;

export {
  useDraftActions,
  useGetDraft,
  useInfiniteDiscoverDrafts,
  useInfiniteFollowingDrafts,
  useInfiniteLibraryDrafts,
  useInfiniteRecentlyRead,
  useTrending,
  useInfiniteTrending,
  useFeedDiscoverDrafts,
  useFeedFollowingDrafts,
  useLibraryDrafts,
  useSavedDrafts,
  useTopics,
  useDraftsByTopics,
}
