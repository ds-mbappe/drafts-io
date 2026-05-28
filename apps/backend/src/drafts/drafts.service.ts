import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/dto/main.dto';
import { draftListSelect, authorSelect } from './drafts.select';
import { CreateDraftDto } from './dto/create-draft.dto';
import { DraftDetail } from 'src/types';
import { handleHttpError } from 'src/utils/handle-http-error';
import { CloudinaryService } from 'src/utils/cloudinary.service';
import { NotificationsService } from 'src/notifications/notifications.service';

const defaultPagination: PaginationDto = {
  take: 10,
  cursor: null,
};

const buildPagination = (dto?: PaginationDto) => ({
  take: (dto?.take ?? 10) + 1,
  ...(dto?.cursor && {
    skip: 1,
    cursor: { id: dto.cursor },
  }),
});

@Injectable()
export class DraftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly notifications: NotificationsService,
  ) {}

  async getDrafts(
    search?: string,
    userId?: string,
    pagination?: PaginationDto,
    topics?: string[],
  ) {
    const where: Prisma.DraftWhereInput = {
      private: false,
      ...(search && {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(topics?.length && { topics: { hasSome: topics } }),
    };

    const page = pagination ?? defaultPagination;

    const docs = await this.prisma.draft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...buildPagination(page),
      select: draftListSelect,
    });

    const hasMore = docs.length > page.take;
    const items = hasMore ? docs.slice(0, -1) : docs;

    return {
      items: await this.attachLikes(items, userId),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async getDraftsOfPeopleIFollow(
    userId: string,
    search?: string,
    pagination?: PaginationDto,
  ) {
    const where: Prisma.DraftWhereInput = {
      private: false,
      author: {
        followers: {
          some: {
            followerId: userId,
          },
        },
      },
      ...(search && {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const page = pagination ?? defaultPagination;

    const docs = await this.prisma.draft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...buildPagination(page),
      select: draftListSelect,
    });

    const hasMore = docs.length > page.take;
    const items = hasMore ? docs.slice(0, -1) : docs;

    return {
      items: await this.attachLikes(items, userId),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async getMyLibrary(
    search?: string,
    userId?: string,
    pagination?: PaginationDto,
  ) {
    const where: Prisma.DraftWhereInput = {
      authorId: userId,
      ...(search && {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const page = pagination ?? defaultPagination;

    const docs = await this.prisma.draft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...buildPagination(page),
      select: draftListSelect,
    });

    const hasMore = docs.length > page.take;
    const items = hasMore ? docs.slice(0, -1) : docs;

    return {
      items: await this.attachLikes(items, userId),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async createDraft(dto: CreateDraftDto, userId: string) {
    const { content, topics, ...rest } = dto;
    const deduplicatedTopics = topics
      ? [...new Set(topics.map((t) => t.trim()))]
      : [];

    const draft = await this.prisma.draft.create({
      data: {
        ...rest,
        topics: deduplicatedTopics,
        authorId: userId,
        ...(content != null && { content }),
      },
      select: {
        id: true,
        cover: true,
        title: true,
        topics: true,
        intro: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        word_count: true,
        character_count: true,
        authorId: true,
        private: true,
        locked: true,
        author: {
          select: {
            id: true,
            avatar: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    return draft;
  }

  async findOneDraft(id: string, userId?: string) {
    const doc: DraftDetail | null = await this.prisma.draft.findUnique({
      where: { id },
      select: {
        id: true,
        cover: true,
        title: true,
        topics: true,
        intro: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        word_count: true,
        authorId: true,
        private: true,
        author: { select: authorSelect },
        _count: {
          select: {
            Comment: true,
            likes: true,
          },
        },
      },
    });

    if (!doc) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (doc.private && doc.authorId !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const [withLike] = await this.attachLikes([doc], userId);

    return withLike;
  }

  async updateDraft(documentId: string, dto: UpdateDraftDto, userId: string) {
    const doc = await this.prisma.draft.findUnique({
      where: { id: documentId },
      select: { authorId: true },
    });

    if (!doc || doc.authorId !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const { ydoc: ydocBase64, ...rest } = dto;
    const data: Record<string, any> = { ...rest };

    if (ydocBase64) {
      // Decode base64-encoded Y.Doc binary state snapshot into a Buffer for Prisma Bytes field
      data.ydoc = Buffer.from(ydocBase64, 'base64');
    }

    const updated = await this.prisma.draft.update({
      where: { id: documentId },
      data,
      select: {
        id: true,
        cover: true,
        title: true,
        topics: true,
        intro: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        word_count: true,
        authorId: true,
        private: true,
        author: { select: authorSelect },
        _count: {
          select: {
            Comment: true,
            likes: true,
          },
        },
      },
    });

    return (await this.attachLikes([updated], userId))[0];
  }

  async toggleLike(documentId: string, userId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: { documentId_userId: { documentId, userId } },
      });

      if (existing) {
        await tx.like.delete({
          where: { documentId_userId: { documentId, userId } },
        });
        return { liked: false, authorId: null as string | null };
      }

      await tx.like.create({ data: { documentId, userId } });

      const draft = await tx.draft.findUnique({
        where: { id: documentId },
        select: { authorId: true },
      });

      return { liked: true, authorId: draft?.authorId ?? null };
    });

    if (result.liked && result.authorId) {
      this.notifications
        .create({
          userId: result.authorId,
          actorId: userId,
          type: 'LIKE',
          draftId: documentId,
        })
        .catch(() => {});
    }

    return { liked: result.liked };
  }

  async getTrending(userId?: string, limit = 10, skip = 0) {
    const scored = await this.prisma.$queryRaw<{ id: string; score: bigint }[]>`
      SELECT d.id,
        (COUNT(DISTINCT rr."userId") * 2 + COUNT(DISTINCT l.id))::bigint AS score
      FROM "Draft" d
      LEFT JOIN "RecentlyRead" rr
        ON rr."draftId" = d.id AND rr."viewedAt" > NOW() - INTERVAL '30 days'
      LEFT JOIN "Like" l ON l."documentId" = d.id
      WHERE d.private = false
      GROUP BY d.id
      ORDER BY score DESC, d."created_at" DESC
      LIMIT ${limit + 1} OFFSET ${skip}
    `;

    const hasMore = scored.length > limit;
    const page = hasMore ? scored.slice(0, -1) : scored;
    const ids = page.map((r) => r.id);

    const drafts = await this.prisma.draft.findMany({
      where: { id: { in: ids } },
      select: draftListSelect,
    });

    const draftMap = new Map(drafts.map((d) => [d.id, d]));
    const ordered = ids.map((id) => draftMap.get(id)).filter(Boolean);

    return {
      items: await this.attachLikes(ordered, userId),
      hasMore,
      nextSkip: skip + limit,
    };
  }

  async getTopics() {
    const rows = await this.prisma.$queryRaw<
      { topic: string; count: bigint }[]
    >`
      SELECT t.topic, COUNT(d.id) AS count
      FROM "Draft" d, unnest(d.topics) AS t(topic)
      WHERE d.private = false
      GROUP BY t.topic
      ORDER BY count DESC, t.topic ASC
    `;
    return rows.map((r) => ({ name: r.topic, count: Number(r.count) }));
  }

  async deleteDraft(id: string) {
    try {
      // Collect all Cloudinary audio URLs across every cached TTS version
      // before the cascade delete removes the DraftTts rows.
      const ttsEntries = await this.prisma.draftTts.findMany({
        where: { draftId: id },
        select: { chunks: true },
      });

      const audioUrls = ttsEntries.flatMap((entry) => {
        const chunks = entry.chunks as Array<{ audioUrl?: string }>;
        return chunks.map((c) => c.audioUrl).filter(Boolean);
      });

      await this.prisma.draft.delete({ where: { id } });

      if (audioUrls.length) {
        await this.cloudinary.deleteResources(audioUrls, 'video');
      }

      return { message: 'Draft deleted successfully.' };
    } catch (error: unknown) {
      handleHttpError(error, 'Error deleting draft');
    }
  }

  async getDraftsByUsername(
    username: string,
    viewerId: string,
    pagination?: PaginationDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) return { items: [], nextCursor: null };

    const page = pagination ?? defaultPagination;
    const docs = await this.prisma.draft.findMany({
      where: { authorId: user.id, private: false },
      orderBy: { createdAt: 'desc' },
      ...buildPagination(page),
      select: draftListSelect,
    });

    const hasMore = docs.length > page.take;
    const items = hasMore ? docs.slice(0, -1) : docs;

    return {
      items: await this.attachLikes(items, viewerId),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  private async attachLikes<T extends { id: string }>(
    docs: T[],
    userId?: string,
  ): Promise<(T & { hasLiked: boolean; hasBookmarked: boolean })[]> {
    if (!userId || docs.length === 0) {
      return docs.map((d) => ({ ...d, hasLiked: false, hasBookmarked: false }));
    }

    const ids = docs.map((d) => d.id);

    const [likes, bookmarks] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId, documentId: { in: ids } },
        select: { documentId: true },
      }),
      this.prisma.bookmark.findMany({
        where: { userId, draftId: { in: ids } },
        select: { draftId: true },
      }),
    ]);

    const likedSet = new Set(likes.map((l) => l.documentId));
    const bookmarkedSet = new Set(bookmarks.map((b) => b.draftId));

    return docs.map((d) => ({
      ...d,
      hasLiked: likedSet.has(d.id),
      hasBookmarked: bookmarkedSet.has(d.id),
    }));
  }
}
