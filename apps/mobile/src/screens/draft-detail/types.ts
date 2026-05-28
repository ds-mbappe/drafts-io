// ── Types ──────────────────────────────────────────────────────────────────────

export interface Author {
  id: string;
  username: string | null;
  avatar: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface DraftDetail {
  id: string;
  title: string;
  intro: string | null;
  cover: string | null;
  topics: string[];
  content: any;
  createdAt: string;
  word_count: number | null;
  authorId: string;
  private: boolean;
  author: Author;
  _count: { Comment: number; likes: number };
  hasLiked: boolean;
  hasBookmarked: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; avatar: string | null; firstname: string | null; lastname: string | null };
}
