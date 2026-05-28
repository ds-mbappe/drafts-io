"use server"

import z from "zod";
import { auth } from "@/auth";
import { backendUrl } from "@/lib/backend";
import { CreateDraftSchema } from "@/lib/validators/draft";
import { DraftProps, ServerActionResult } from "@/lib/types";

const createDraft = async (rawData: unknown): Promise<ServerActionResult<DraftProps>> => {
  const parsed = CreateDraftSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: z.treeifyError(parsed.error) };
  }

  try {
    const session = await auth();

    const res = await fetch(backendUrl('/api/drafts'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error('[createDraft] backend error:', res.status, msg);
      return { success: false, error: { errors: ['Failed to create draft'] } };
    }

    const draft = await res.json();
    return { success: true, data: draft };
  } catch (e) {
    console.error('[createDraft]', e);
    return { success: false, error: { errors: ['Failed to create draft'] } };
  }
}

export { createDraft }
