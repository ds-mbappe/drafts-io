import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/dto/main.dto';
import { draftListSelect, draftDetailSelect } from './drafts.select';
import { DraftDetail } from 'src/types';

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
  constructor(private readonly prisma: PrismaService) {}

  async getDrafts(
    search?: string,
    userId?: string,
    pagination?: PaginationDto,
  ) {
    const where: Prisma.DocumentWhereInput = {
      private: false,
      ...(search && {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const page = pagination ?? defaultPagination;

    const docs = await this.prisma.document.findMany({
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
    const where: Prisma.DocumentWhereInput = {
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

    const docs = await this.prisma.document.findMany({
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
    userId: string,
    search?: string,
    pagination?: PaginationDto,
  ) {
    const where: Prisma.DocumentWhereInput = {
      authorId: userId,
      ...(search && {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const page = pagination ?? defaultPagination;

    const docs = await this.prisma.document.findMany({
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

  async findOneDraft(id: string, userId?: string) {
    const doc: DraftDetail | null = await this.prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        cover: true,
        title: true,
        topic: true,
        intro: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        word_count: true,
        authorId: true,
        private: true,
        author: {
          select: {
            id: true,
            avatar: true,
            firstname: true,
            lastname: true,
          },
        },
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
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { authorId: true },
    });

    if (!doc || doc.authorId !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: dto,
      select: {
        id: true,
        cover: true,
        title: true,
        topic: true,
        intro: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        word_count: true,
        authorId: true,
        private: true,
        author: {
          select: {
            id: true,
            avatar: true,
            firstname: true,
            lastname: true,
          },
        },
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
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: {
          documentId_userId: { documentId, userId },
        },
      });

      if (existing) {
        await tx.like.delete({
          where: {
            documentId_userId: { documentId, userId },
          },
        });
        return { liked: false };
      }

      await tx.like.create({
        data: { documentId, userId },
      });

      return { liked: true };
    });
  }

  async deleteDraft(id: string) {
    try {
      await this.prisma.document.delete({
        where: {
          id: id,
        },
      });

      return { message: 'Draft deleted successfully.' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error deleting draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async attachLikes<T extends { id: string }>(
    docs: T[],
    userId?: string,
  ): Promise<(T & { hasLiked: boolean })[]> {
    if (!userId || docs.length === 0) {
      return docs.map((d) => ({ ...d, hasLiked: false }));
    }

    const likes = await this.prisma.like.findMany({
      where: {
        userId,
        documentId: { in: docs.map((d) => d.id) },
      },
      select: { documentId: true },
    });

    const likedSet = new Set(likes.map((l) => l.documentId));

    return docs.map((d) => ({
      ...d,
      hasLiked: likedSet.has(d.id),
    }));
  }
}
