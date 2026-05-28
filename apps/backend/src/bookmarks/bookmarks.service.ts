import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { draftListSelect } from 'src/drafts/drafts.select';
import { handleHttpError } from 'src/utils/handle-http-error';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(draftId: string, userId: string) {
    try {
      const existing = await this.prisma.bookmark.findUnique({
        where: { draftId_userId: { draftId, userId } },
      });

      if (existing) {
        await this.prisma.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      }

      await this.prisma.bookmark.create({ data: { draftId, userId } });
      return { bookmarked: true };
    } catch (error) {
      handleHttpError(error);
    }
  }

  async getSaved(userId: string) {
    try {
      const bookmarks = await this.prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
          draft: { select: draftListSelect },
        },
      });

      const drafts = bookmarks.map((b) => ({
        ...b.draft,
        savedAt: b.createdAt,
      }));

      // Attach hasBookmarked (always true here) and hasLiked
      const likedSet = new Set(
        (
          await this.prisma.like.findMany({
            where: { userId, documentId: { in: drafts.map((d) => d.id) } },
            select: { documentId: true },
          })
        ).map((l) => l.documentId),
      );

      return drafts.map((d) => ({
        ...d,
        hasLiked: likedSet.has(d.id),
        hasBookmarked: true,
      }));
    } catch (error) {
      handleHttpError(error);
    }
  }
}
