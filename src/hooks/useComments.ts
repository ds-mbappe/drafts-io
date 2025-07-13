import useSWR from 'swr'

const fetchDocumentComments = async (documentId: string) => {
  const res = await fetch(`/api/comments?documentId=${documentId}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  if (!res.ok) throw new Error('Failed to fetch document comments')

  const data = await res.json()

  return data.comments;
}

export function useComments(documentId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/comments?documentId=${documentId}`,
    () => fetchDocumentComments(documentId),
    { revalidateOnFocus: false, suspense: true }
  )

  return {
    comments: data,
    commentsLoading: isLoading,
    error,
    mutate,
  }
}