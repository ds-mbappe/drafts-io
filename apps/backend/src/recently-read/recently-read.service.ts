import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { draftListSelect } from 'src/drafts/drafts.select';
import { handleHttpError } from 'src/utils/handle-http-error';

@Injectable()
export class RecentlyReadService {
  constructor(private readonly prisma: PrismaService) {}

  async record(userId: string, draftId: string) {
    try {
      await this.prisma.recentlyRead.upsert({
        where: { userId_draftId: { userId, draftId } },
        update: { viewedAt: new Date() },
        create: { userId, draftId },
      });
      return { ok: true };
    } catch (error) {
      handleHttpError(error);
    }
  }

  async getRecentlyRead(userId: string, cursor?: string) {
    try {
      const take = 10;
      const rows = await this.prisma.recentlyRead.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        take: take + 1,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        select: {
          id: true,
          viewedAt: true,
          draft: { select: draftListSelect },
        },
      });

      const hasMore = rows.length > take;
      const items = hasMore ? rows.slice(0, -1) : rows;
      const ids = items.map((r) => r.draft.id);

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

      return {
        items: items.map((r) => ({
          ...r.draft,
          viewedAt: r.viewedAt,
          hasLiked: likedSet.has(r.draft.id),
          hasBookmarked: bookmarkedSet.has(r.draft.id),
        })),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    } catch (error) {
      handleHttpError(error);
    }
  }
}
