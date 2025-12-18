import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { prisma } from 'prisma/client';

@Injectable()
export class GlobalSearchService {
  constructor() {}

  async search(text?: string) {
    try {
      if (text?.startsWith('@')) {
        const users = await prisma.user.findMany({
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
              mode: 'insensitive',
            },
          },
        });

        return { users };
      } else {
        const [users, documents] = await Promise.all([
          prisma.user.findMany({
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
                    mode: 'insensitive',
                  },
                },
                {
                  lastname: {
                    contains: text,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          }),

          prisma.document.findMany({
            take: 10,
            select: {
              id: true,
              title: true,
              updatedAt: true,
            },
            where: {
              title: {
                contains: text,
                mode: 'insensitive',
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
