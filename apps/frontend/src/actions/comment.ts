'use server'

import { auth } from '@/auth';
import { backendUrl } from '@/lib/backend';

export async function getDocumentComments(draftId: string) {
  try {
    const session = await auth();
    const res = await fetch(backendUrl(`/api/comments?draftId=${draftId}`), {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    });

    if (!res.ok) return { success: false, error: res.statusText };

    return await res.json();
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function getCommentById(id: string) {
  try {
    const session = await auth();
    const res = await fetch(backendUrl(`/api/comments/${id}`), {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    });

    if (!res.ok) return { success: false, error: res.statusText };

    return await res.json();
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function createComment({
  draftId,
  text,
  from,
  to,
}: {
  draftId: string;
  text: string;
  from: number;
  to: number;
}) {
  try {
    const session = await auth();
    const res = await fetch(backendUrl('/api/comments'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draftId, text, from, to }),
    });

    if (!res.ok) return { success: false, error: res.statusText };

    return await res.json();
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function updateComment({
  id,
  text,
}: {
  id: string | undefined;
  text: string | undefined;
}) {
  try {
    const session = await auth();
    const res = await fetch(backendUrl(`/api/comments/${id}`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return { success: false, error: res.statusText };

    return await res.json();
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function deleteComment(id: string | undefined) {
  try {
    const session = await auth();
    const res = await fetch(backendUrl(`/api/comments/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    });

    if (!res.ok) return { success: false, error: res.statusText };

    return await res.json();
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
