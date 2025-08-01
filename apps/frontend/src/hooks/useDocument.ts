'use client'

import { DocumentCardTypeprops } from '@/lib/types';
import useSWR from 'swr';

const fetchDocument = async (documentID: string) => {
  const res = await fetch(`/api/document/${documentID}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  if (!res.ok) throw new Error('Failed to fetch document')

  const data = await res.json()

  return data.document;
}

const fetchLatestDrafts = async (url: string, token: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
  })

  if (!res.ok) throw new Error('Failed to fetch user documents')

  const data = await res.json()

  return data.drafts;
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

const fetchDocumentLikes = async (documentId: string, userId: string) => {
  const res = await fetch(`/api/document/${documentId}/like?userId=${userId}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch document likes");

  return res.json();
};

const toggleDocumentLike = async (documentId: string, userId: string, hasLiked: boolean) => {
  const res = await fetch(`/api/document/${documentId}/like`, {
    method: hasLiked ? 'DELETE' : 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) throw new Error("Toggle like failed");

  return res.json();
};

const updateDocument = async (documentId: String, formData?: Object) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formData }),
  });
  
  if (!res.ok) throw new Error('Failed to update document');

  return res.json();
}

const deleteDocument = async (documentId: String) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) throw new Error('Failed to delete document');

  return res.json();
}

const useDocument = (documentId: string | null) => {
  const shouldFetch = !!documentId;

  const { data, error, isLoading, mutate } = useSWR<DocumentCardTypeprops>(
    shouldFetch ? ['/api/document', documentId] : null,
    () => fetchDocument(documentId!),
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

const useDocumentLikes = (documentId: string, userId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? [`/api/document/${documentId}/like`, userId] : null,
    () => fetchDocumentLikes(documentId, userId),
    { revalidateOnFocus: false }
  );

  return {
    likeCount: data?.likeCount ?? 0,
    hasLiked: data?.hasLiked ?? false,
    isLoading,
    error,
    mutate
  };
}

export {
  useDocument,
  updateDocument,
  useLatestDrafts,
  useLibraryDocuments,
  useDocumentLikes,
  toggleDocumentLike,
  deleteDocument,
}