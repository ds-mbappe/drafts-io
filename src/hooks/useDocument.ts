import { DocumentCardTypeprops } from '@/lib/types';
import useSWR, { mutate } from 'swr';

const fetchDocument = async (documentID: string) => {
  const res = await fetch(`/api/document/${documentID}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  if (!res.ok) throw new Error('Failed to fetch document')

  const data = await res.json()

  return data.document;
}

const fetchLatestDocuments = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { "Content-Type": "application/json" },
  })

  if (!res.ok) throw new Error('Failed to fetch user documents')

  const data = await res.json()

  return data.documents;
}

const fetchLibraryDocuments = async (url: string) => {
  const res = await fetch(url, {
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
    { revalidateOnFocus: false, suspense: true }
  );

  return {
    document: data,
    isLoading,
    error,
    mutate,
  };
}

const useLatestDocuments = (userId: string) => {
  const shouldFetch = !!userId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/api/documents?userId=${userId}` : null,
    fetchLatestDocuments,
    { revalidateOnFocus: false, suspense: true }
  );

  return {
    documents: data,
    isLoading,
    error,
    mutate,
  };
}

const useLibraryDocuments = (userId: string | null) => {
  const shouldFetch = !!userId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/api/documents?userId=${userId}/library` : null,
    fetchLibraryDocuments,
    { revalidateOnFocus: false, suspense: true }
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
  useLatestDocuments,
  useLibraryDocuments,
  useDocumentLikes,
  toggleDocumentLike,
  deleteDocument,
}