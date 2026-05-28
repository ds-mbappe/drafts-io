import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

const commentSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  from: true,
  to: true,
  text: true,
  user: {
    select: {
      id: true,
      avatar: true,
      lastname: true,
      firstname: true,
    },
  },
};

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getComments(draftId?: string) {
    if (!draftId) {
      throw new BadRequestException('Missing draftId');
    }

    const comments = await this.prisma.comment.findMany({
      where: { documentId: draftId },
      orderBy: { createdAt: 'asc' },
      select: commentSelect,
    });

    return { comments };
  }

  async getCommentById(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: commentSelect,
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return { comment };
  }

  async createComment(data: {
    id?: string;
    draftId: string;
    userId: string;
    text: string;
    from: number;
    to: number;
  }) {
    const { draftId, id, ...rest } = data;
    const comment = await this.prisma.comment.create({
      // Use the client-supplied id (tiptop's UUID) so the same ID is shared
      // between the editor mark, the context, and the DB row — no mapping needed.
      data: { ...(id ? { id } : {}), ...rest, documentId: draftId },
      select: commentSelect,
    });

    // Notify the draft author
    const draft = await this.prisma.draft.findUnique({
      where: { id: draftId },
      select: { authorId: true },
    });
    if (draft) {
      this.notifications
        .create({
          userId: draft.authorId,
          actorId: data.userId,
          type: 'COMMENT',
          draftId,
        })
        .catch(() => {});
    }

    return { comment };
  }

  async updateComment(id: string, text: string) {
    const comment = await this.prisma.comment.update({
      where: { id },
      data: { text },
      select: commentSelect,
    });

    return { comment };
  }

  async deleteComment(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) throw new NotFoundException('Comment not found');

    await this.prisma.comment.delete({ where: { id } });

    return { success: true };
  }
}
