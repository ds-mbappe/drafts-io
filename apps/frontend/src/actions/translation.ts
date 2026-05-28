"use server"

import { auth } from "@/auth";
import { backendUrl } from "@/lib/backend";
import type { DraftTranslation } from "@/lib/types";

async function getAuthHeaders() {
  const session = await auth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.accessToken}`,
  };
}

export async function saveTranslation(
  draftId: string,
  language: string,
  content: Record<string, unknown>,
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(backendUrl('/api/translations'), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ draftId, language, content }),
    });
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

export async function getTranslations(draftId: string): Promise<DraftTranslation[]> {
  try {
    const res = await fetch(backendUrl(`/api/translations?draftId=${draftId}`), {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function deleteTranslation(
  draftId: string,
  language: string,
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(backendUrl(`/api/translations/${language}?draftId=${draftId}`), {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}
