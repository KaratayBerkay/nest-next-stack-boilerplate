import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { NotificationGateway } from './notification.gateway';
import type { NotificationType } from '../@generated/prisma/notification-type.enum';

interface CreateNotificationParams {
  userId: string;
  actorId: string | null;
  type: keyof typeof NotificationType;
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
    private readonly push: PushNotificationService,
    private readonly tokenStore: TokenStoreService,
  ) {}

  async create(params: CreateNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        actorId: params.actorId,
        type: params.type,
        title: params.title,
        body: params.body,
        payload: (params.payload ?? {}) as never,
      },
      include: { actor: true },
    });

    this.gateway.sendToUser(params.userId, notification);

    this.push.sendToUser(
      params.userId,
      params.title,
      params.body,
      undefined,
      params.payload,
    );

    // Increment the unread counter in Redis (fire-and-forget).
    this.tokenStore.incrUnreadForUser(params.userId, 1).catch(() => {});

    return notification;
  }

  async findByUser(userId: string, cursor?: string, take = 20) {
    return this.prisma.notification.findMany({
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markRead(id: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });

    // Recount and rewrite (drift-free — no negative-HINCRBY bookkeeping).
    if (result.count > 0) {
      const unread = await this.unreadCount(userId);
      this.tokenStore
        .rewriteFieldsForUser(userId, { unread: String(unread) })
        .catch(() => {});
    }

    return result;
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    // Recount and rewrite (drift-free).
    const unread = await this.unreadCount(userId);
    this.tokenStore
      .rewriteFieldsForUser(userId, { unread: String(unread) })
      .catch(() => {});
  }
}
