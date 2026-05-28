import { Prisma } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export type UploadProgressCallback = (progress: {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
}) => void;

export type DraftDetail = Prisma.DraftGetPayload<{
  select: {
    id: true;
    cover: true;
    title: true;
    topics: true;
    intro: true;
    content: true;
    createdAt: true;
    updatedAt: true;
    word_count: true;
    authorId: true;
    private: true;
    author: {
      select: {
        id: true;
        username: true;
        avatar: true;
        firstname: true;
        lastname: true;
      };
    };
    _count: {
      select: {
        Comment: true;
        likes: true;
      };
    };
  };
}>;
