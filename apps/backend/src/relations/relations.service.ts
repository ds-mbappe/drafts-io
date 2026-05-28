import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { handleHttpError } from 'src/utils/handle-http-error';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class RelationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async follow(followerId?: string, followingId?: string) {
    if (!followerId || !followingId) {
      throw new BadRequestException('Missing followerId or followingId');
    }

    try {
      await this.prisma.follows.create({
        data: {
          followerId,
          followingId,
        },
      });

      this.notifications
        .create({
          userId: followingId,
          actorId: followerId,
          type: 'FOLLOW',
        })
        .catch(() => {});
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User is already followed.');
      }

      handleHttpError(error, 'Error following user');
    }

    return { followed: true };
  }

  async unfollow(followerId?: string, followingId?: string) {
    if (!followerId || !followingId) {
      throw new BadRequestException('Missing followerId or followingId');
    }

    const isFollowing = await this.prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (isFollowing) {
      await this.prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
    }

    return { message: 'User unfollowed.' };
  }

  async checkFollow(followerId?: string, followingId?: string) {
    if (!followerId || !followingId) {
      throw new BadRequestException('Missing followerId or followingId');
    }

    const data = await this.prisma.follows.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    return { isFollowing: !!data };
  }

  async getFollowData(id?: string) {
    if (!id) {
      throw new BadRequestException('Missing user id');
    }

    const [followers, following] = await Promise.all([
      this.prisma.follows.count({
        where: {
          followingId: id,
        },
      }),
      this.prisma.follows.count({
        where: {
          followerId: id,
        },
      }),
    ]);

    return {
      followData: {
        followers_count: followers,
        following_count: following,
      },
    };
  }
}
