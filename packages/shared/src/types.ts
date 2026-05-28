// ---------------------------------------------------------------------------
// Domain types shared between the web frontend and the React Native mobile app.
// Keep this file free of any platform-specific imports (Next.js, React Native, etc.)
// ---------------------------------------------------------------------------

export type DraftTranslation = {
  language: string;
  content: Record<string, any>;
  updatedAt: string;
};

export type DraftPagination = {
  items: DraftProps[] | null;
  nextCursor: string | null;
};

export type DraftProps = {
  id: string;
  title: string;
  private: boolean;
  locked: boolean;
  author: BaseUser;
  createdAt?: Date;
  updatedAt?: Date;
  cover: string | null;
  topics: string[];
  content: Record<string, any> | null;
  intro: string | null;
  word_count: number | null;
  character_count: number | null;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
  savedAt?: string;
  _count?: {
    Comment?: number;
    likes?: number;
  };
};

export type CommentCardProps = {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  text?: string;
  from: number;
  to: number;
  user?: {
    id?: string;
    avatar?: string;
    lastname?: string;
    firstname?: string;
    username?: string;
  };
};

export type BaseUser = {
  id?: string;
  email?: string;
  avatar: string | null;
  firstname: string | null;
  lastname: string | null;
  phone?: string;
  username?: string;
  followers?: number;
  following?: number;
  hasPassword?: boolean;
  publishedDrafts?: number;
  totalLikes?: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  createdAt?: string;
  language?: string;
};

export type EditUser = {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  followers?: number;
  following?: number;
};

export type TranslationLanguage = {
  key: string;
  title: string;
  flag: string;
};

export type NotificationType = 'FOLLOW' | 'LIKE' | 'COMMENT';

export type AppNotification = {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  draftId: string | null;
  actor: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    username: string | null;
    avatar: string | null;
  };
  draft: {
    id: string;
    title: string;
  } | null;
};

export type NotificationPreferences = {
  notifyOnFollow: boolean;
  notifyOnLike: boolean;
  notifyOnComment: boolean;
};