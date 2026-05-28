import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { Subject } from 'rxjs';
import { PrismaService } from 'prisma/prisma.service';

export interface NotificationSseEvent {
  type: 'notification' | 'unread_count';
  data: unknown;
}

const notificationSelect = {
  id: true,
  type: true,
  read: true,
  createdAt: true,
  draftId: true,
  actor: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      username: true,
      avatar: true,
    },
  },
  draft: {
    select: {
      id: true,
      title: true,
    },
  },
};

@Injectable()
export class NotificationsService {
  // Map<userId, Set<Subject>> — supports multiple tabs per user
  private readonly streams = new Map<
    string,
    Set<Subject<NotificationSseEvent>>
  >();

  constructor(private readonly prisma: PrismaService) {}

  // ── SSE stream management ─────────────────────────────────────────────────

  createStream(userId: string): Subject<NotificationSseEvent> {
    const subject = new Subject<NotificationSseEvent>();
    if (!this.streams.has(userId)) this.streams.set(userId, new Set());
    this.streams.get(userId).add(subject);
    return subject;
  }

  removeStream(userId: string, subject: Subject<NotificationSseEvent>) {
    const set = this.streams.get(userId);
    if (!set) return;
    set.delete(subject);
    subject.complete();
    if (set.size === 0) this.streams.delete(userId);
  }

  private pushToUser(userId: string, event: NotificationSseEvent) {
    this.streams.get(userId)?.forEach((s) => s.next(event));
  }

  private async pushUnreadCount(userId: string) {
    const count = await this.getUnreadCount(userId);
    this.pushToUser(userId, { type: 'unread_count', data: { count } });
  }

  // ── Notifications CRUD ────────────────────────────────────────────────────

  async create(data: {
    userId: string;
    actorId: string;
    type: NotificationType;
    draftId?: string;
  }) {
    if (data.userId === data.actorId) return null;

    const prefs = await this.getPreferences(data.userId);
    if (data.type === 'FOLLOW' && !prefs.notifyOnFollow) return null;
    if (data.type === 'LIKE' && !prefs.notifyOnLike) return null;
    if (data.type === 'COMMENT' && !prefs.notifyOnComment) return null;

    const notification = await this.prisma.notification.create({
      data,
      select: notificationSelect,
    });

    this.pushToUser(data.userId, { type: 'notification', data: notification });
    await this.pushUnreadCount(data.userId);

    return notification;
  }

  async getForUser(userId: string, cursor?: string, take = 10) {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      select: notificationSelect,
    });

    const hasMore = rows.length > take;
    return {
      notifications: hasMore ? rows.slice(0, -1) : rows,
      nextCursor: hasMore ? rows[take - 1].id : null,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    await this.pushUnreadCount(userId);
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    await this.pushUnreadCount(userId);
    return { success: true };
  }

  async deleteOne(id: string, userId: string) {
    await this.prisma.notification.deleteMany({ where: { id, userId } });
    await this.pushUnreadCount(userId);
    return { success: true };
  }

  async deleteAll(userId: string) {
    await this.prisma.notification.deleteMany({ where: { userId } });
    await this.pushUnreadCount(userId);
    return { success: true };
  }

  // ── Preferences ───────────────────────────────────────────────────────────

  async getPreferences(userId: string) {
    return this.prisma.notificationPreferences.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updatePreferences(
    userId: string,
    data: Partial<{
      notifyOnFollow: boolean;
      notifyOnLike: boolean;
      notifyOnComment: boolean;
    }>,
  ) {
    return this.prisma.notificationPreferences.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
