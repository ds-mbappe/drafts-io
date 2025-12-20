'use client'

import useSWR from 'swr';
import { DraftProps } from '@/lib/types';
import { useAuthFetcher } from './useAuthFetcher';

const fetchLibraryDocuments = async (userID: string) => {
  const res = await fetch(`/api/documents/${userID}/library`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  if (!res.ok) throw new Error('Failed to fetch user library')

  const data = await res.json()

  return data.documents;
}

const toggleDocumentLike = async (documentId: string, token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts/${documentId}/toggle_like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Toggle like failed.");

  return res.json();
};

const updateDocument = async (documentId: String, token: string, formData?: Object) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts/${documentId}`, {
    method: "PUT",
    headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ formData }),
  });
  
  if (!res.ok) throw new Error('Failed to update document');

  return res.json();
}

const deleteDraft = async (documentId: String, token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts/${documentId}`, {
    method: "DELETE",
    headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
  });
  
  if (!res.ok) throw new Error('Failed to delete document');

  return res.json();
}

const useGetDraft = (documentId: string | null) => {
  const { fetcher, token } = useAuthFetcher();

  const { data, error, isLoading, mutate } = useSWR<DraftProps>(
    token ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts/${documentId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    draft: data,
    isLoading,
    error,
    mutate,
  };
}

const useFeedDiscoverDrafts = () => {
  const { fetcher, token } = useAuthFetcher();

  const { data, error, isLoading, mutate } = useSWR<DraftProps[]>(
    token ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts` : null,
    fetcher,
    { revalidateOnFocus: false, suspense: true }
  );

  return {
    drafts: data,
    isLoading,
    error,
    mutate,
  };
}

const useFeedFollowingDrafts = () => {
  const { fetcher, token } = useAuthFetcher();

  const { data, error, isLoading, mutate } = useSWR<DraftProps[]>(
    token ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts/following` : null,
    fetcher,
    { revalidateOnFocus: false, suspense: true }
  );

  return {
    drafts: data,
    isLoading,
    error,
    mutate,
  };
}

const useLibraryDocuments = (userId: string | null) => {
  const shouldFetch = !!userId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['/api/documents', userId] : null,
    ([, uid]) => fetchLibraryDocuments(uid),
    { revalidateOnFocus: false }
  );

  return {
    documents: data,
    isLoading,
    error,
    mutate,
  };
}

export {
  useGetDraft,
  updateDocument,
  useFeedDiscoverDrafts,
  useFeedFollowingDrafts,
  useLibraryDocuments,
  toggleDocumentLike,
  deleteDraft,
}