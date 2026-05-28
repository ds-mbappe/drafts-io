// Platform-agnostic types live in @drafts-io/shared — re-export them here
// so existing frontend imports continue to work without changes.
export type {
  DraftTranslation,
  DraftPagination,
  DraftProps,
  CommentCardProps,
  BaseUser,
  EditUser,
  TranslationLanguage,
  NotificationType,
  AppNotification,
  NotificationPreferences,
} from '@drafts-io/shared';

import { DefaultSession } from "next-auth";
import type { z } from "zod";
import { CreateDraftSchema } from "./validators/draft";

// ---------------------------------------------------------------------------
// Frontend-only types (Next.js / tiptap / server actions)
// ---------------------------------------------------------------------------

export type CharacterCount = {
  words: () => number;
  characters: () => number;
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      refreshToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    refreshToken?: string;
    accessToken?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export type ZodTreeError = {
  errors: string[];
  properties?: {
    [key: string]: {
      errors?: string[];
      properties?: ZodTreeError["properties"];
    } | undefined;
  };
};

export type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodTreeError };

export type DraftInput = z.infer<typeof CreateDraftSchema>;