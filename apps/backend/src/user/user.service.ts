import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { handleHttpError } from 'src/utils/handle-http-error';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  username: true,
  avatar: true,
  firstname: true,
  lastname: true,
  phone: true,
  language: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string) {
    if (!id) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  async getMyProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          firstname: true,
          lastname: true,
          createdAt: true,
          _count: { select: { followers: true, following: true } },
        },
      });
      if (!user) throw new NotFoundException('User not found');

      const [publishedDrafts, totalLikes] = await Promise.all([
        this.prisma.draft.count({
          where: { authorId: userId, private: false },
        }),
        this.prisma.like.count({ where: { document: { authorId: userId } } }),
      ]);

      const { _count, ...rest } = user;
      return {
        ...rest,
        stats: {
          followers: _count.followers,
          following: _count.following,
          publishedDrafts,
          totalLikes,
        },
      };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async getUserByUsername(username: string, viewerId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          avatar: true,
          firstname: true,
          lastname: true,
          createdAt: true,
          _count: { select: { followers: true, following: true } },
        },
      });
      if (!user) throw new NotFoundException('User not found');

      const [publishedDrafts, totalLikes, isFollowing] = await Promise.all([
        this.prisma.draft.count({
          where: { authorId: user.id, private: false },
        }),
        this.prisma.like.count({ where: { document: { authorId: user.id } } }),
        this.prisma.follows.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: user.id,
            },
          },
        }),
      ]);

      const { _count, ...rest } = user;
      return {
        ...rest,
        isFollowing: !!isFollowing,
        isOwnProfile: user.id === viewerId,
        stats: {
          followers: _count.followers,
          following: _count.following,
          publishedDrafts,
          totalLikes,
        },
      };
    } catch (error: unknown) {
      handleHttpError(error);
    }
  }

  async updateUser(id: string, dto?: UpdateUserDto) {
    if (!id) {
      throw new BadRequestException('User id is required');
    }

    const data: UpdateUserDto = {};

    if (dto?.firstname !== undefined) data.firstname = dto.firstname;
    if (dto?.lastname !== undefined) data.lastname = dto.lastname;
    if (dto?.email !== undefined) data.email = dto.email;
    if (dto?.phone !== undefined) data.phone = dto.phone;
    if (dto?.avatar !== undefined) data.avatar = dto.avatar;
    if (dto?.username !== undefined) data.username = dto.username;
    if (dto?.language !== undefined) data.language = dto.language;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No update fields provided');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return { user };
  }
}
