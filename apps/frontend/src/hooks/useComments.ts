import useSWR from 'swr'
import { useAuthFetcher } from '@/hooks/useAuthFetcher';
import type { CommentCardProps } from '@/lib/types';

export function useComments(draftId: string) {
  const { fetcher } = useAuthFetcher();

  const { data, error, isLoading, mutate } = useSWR<CommentCardProps[]>(
    draftId ? `/api/comments?draftId=${draftId}` : null,
    async (url: string) => {
      const response = await fetcher(url);
      return response.comments as CommentCardProps[];
    },
    { revalidateOnFocus: false }
  )

  return {
    comments: data,
    commentsLoading: isLoading,
    error,
    mutate,
  }
}
