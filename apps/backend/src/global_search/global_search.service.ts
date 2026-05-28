import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { handleHttpError } from 'src/utils/handle-http-error';

const TAKE = 10;

@Injectable()
export class GlobalSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(text?: string, type?: 'users' | 'drafts', skip = 0) {
    try {
      if (text?.startsWith('@')) {
        const username = text.split('@')[1];
        const where = {
          username: { startsWith: username, mode: Prisma.QueryMode.insensitive },
        };
        const [users, usersTotal] = await Promise.all([
          this.prisma.user.findMany({
            take: TAKE, skip,
            select: { avatar: true, username: true, lastname: true, firstname: true },
            where,
          }),
          this.prisma.user.count({ where }),
        ]);
        return { users, usersTotal, hasMoreUsers: skip + users.length < usersTotal };
      }

      const userWhere = {
        OR: [
          { firstname: { contains: text, mode: Prisma.QueryMode.insensitive } },
          { lastname: { contains: text, mode: Prisma.QueryMode.insensitive } },
        ],
      };
      const draftWhere = {
        title: { contains: text, mode: Prisma.QueryMode.insensitive },
        private: false,
      };

      if (type === 'users') {
        const [users, usersTotal] = await Promise.all([
          this.prisma.user.findMany({
            take: TAKE, skip,
            select: { avatar: true, username: true, lastname: true, firstname: true },
            where: userWhere,
          }),
          this.prisma.user.count({ where: userWhere }),
        ]);
        return { users, usersTotal, hasMoreUsers: skip + users.length < usersTotal };
      }

      if (type === 'drafts') {
        const [drafts, draftsTotal] = await Promise.all([
          this.prisma.draft.findMany({
            take: TAKE, skip,
            select: { id: true, title: true, cover: true, updatedAt: true },
            where: draftWhere,
          }),
          this.prisma.draft.count({ where: draftWhere }),
        ]);
        return { drafts, draftsTotal, hasMoreDrafts: skip + drafts.length < draftsTotal };
      }

      // Initial load — both
      const [users, drafts, usersTotal, draftsTotal] = await Promise.all([
        this.prisma.user.findMany({
          take: TAKE,
          select: { avatar: true, username: true, lastname: true, firstname: true },
          where: userWhere,
        }),
        this.prisma.draft.findMany({
          take: TAKE,
          select: { id: true, title: true, cover: true, updatedAt: true },
          where: draftWhere,
        }),
        this.prisma.user.count({ where: userWhere }),
        this.prisma.draft.count({ where: draftWhere }),
      ]);

      return {
        users, drafts, usersTotal, draftsTotal,
        hasMoreUsers: users.length < usersTotal,
        hasMoreDrafts: drafts.length < draftsTotal,
      };
    } catch (error: unknown) {
      handleHttpError(error, 'Error retrieving search results');
    }
  }
}
