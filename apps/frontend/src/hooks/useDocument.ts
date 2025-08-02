'use client'

import { DocumentCardTypeprops } from '@/lib/types';
import useSWR from 'swr';

const fetchDraft = async (url: string, token: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error('Failed to fetch draft.')

  const data = await res.json()

  return data;
}

const fetchLatestDrafts = async (url: string, token: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
  })

  if (!res.ok) throw new Error('Failed to fetch latest drafts.')

  const data = await res.json()

  return data;
}

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

const useDocument = (documentId: string | null, token: string) => {
  const shouldFetch = !!documentId && token;

  const { data, error, isLoading, mutate } = useSWR<DocumentCardTypeprops>(
    shouldFetch ? ['draft', documentId, token] : null,
    () => fetchDraft(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts/${documentId}`, token),
    { revalidateOnFocus: false }
  );

  return {
    document: data,
    isLoading,
    error,
    mutate,
  };
}

const useLatestDrafts = (token: string) => {
  const shouldFetch = !!token;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['drafts', token] : null,
    () => fetchLatestDrafts(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/drafts`, token),
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
  useDocument,
  updateDocument,
  useLatestDrafts,
  useLibraryDocuments,
  toggleDocumentLike,
  deleteDraft,
}