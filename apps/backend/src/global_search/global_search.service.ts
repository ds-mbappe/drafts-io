import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GlobalSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(text?: string) {
    try {
      if (text?.startsWith('@')) {
        const users = await this.prisma.user.findMany({
          take: 10,
          select: {
            avatar: true,
            username: true,
            lastname: true,
            firstname: true,
          },
          where: {
            username: {
              startsWith: text?.split('@')[1],
              mode: Prisma.QueryMode.insensitive,
            },
          },
        });

        return { users };
      } else {
        const [users, documents] = await Promise.all([
          this.prisma.user.findMany({
            take: 10,
            select: {
              avatar: true,
              username: true,
              lastname: true,
              firstname: true,
            },
            where: {
              OR: [
                {
                  firstname: {
                    contains: text,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  lastname: {
                    contains: text,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          }),

          this.prisma.document.findMany({
            take: 10,
            select: {
              id: true,
              title: true,
              updatedAt: true,
            },
            where: {
              title: {
                contains: text,
                mode: Prisma.QueryMode.insensitive,
              },
              private: false,
            },
          }),
        ]);

        return { users, documents };
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error retrieving draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
