import { ForbiddenException, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { displayName } from '../common/utils/display-name';
import { initials, type MessageAttachment } from './messaging.types';

export class MessagingDmService {
  private readonly logger = new Logger(MessagingDmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheAsideService,
    private readonly realtime: RealtimeGateway,
    private readonly push: PushNotificationService,
  ) {}

  /**
   * Withholds avatarUrl when its owner has hidden it from everyone but
   * themselves. Always strips the raw hideAvatar flag from the result too —
   * this service is read by a plain REST controller with no GraphQL-style
   * schema filtering, so anything left on the object goes straight to JSON.
   */
  private redactAvatar<
    T extends { id: string; avatarUrl: string | null; hideAvatar: boolean },
  >(user: T, viewerId: string): Omit<T, 'hideAvatar'> {
    const { hideAvatar, ...rest } = user;
    if (hideAvatar && user.id !== viewerId) {
      return { ...rest, avatarUrl: null };
    }
    return rest;
  }

  async getConversations(
    userId: string,
    getFriendIds: (userId: string) => Promise<string[]>,
  ) {
    const cacheKey = `conversations:${userId}`;
    const cached = await this.cache.get<
      {
        user: {
          id: string;
          email: string;
          name: string | null;
          avatar: string;
        };
        lastMessage: string;
        lastTime: Date;
        unread: number;
      }[]
    >(cacheKey);
    if (cached) return cached;

    const friendIds = await getFriendIds(userId);
    if (friendIds.length === 0) return [];

    const unreads = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: { recipientId: userId, readAt: null, senderId: { in: friendIds } },
      _count: { id: true },
    });
    const unreadMap = new Map<string, number>(
      unreads.map((u) => [u.senderId, u._count.id]),
    );

    const sentMessages = await this.prisma.$queryRawUnsafe<
      Array<{
        id: string;
        body: string | null;
        recipientId: string;
        createdAt: Date;
        encrypted: boolean;
        envelope: unknown;
      }>
    >(
      `SELECT DISTINCT ON ("recipientId") id, body, "recipientId", "createdAt", encrypted, envelope FROM "Message" WHERE "senderId" = $1::uuid AND "recipientId" = ANY($2::uuid[]) ORDER BY "recipientId", "createdAt" DESC`,
      userId,
      friendIds,
    );
    const receivedMessages = await this.prisma.$queryRawUnsafe<
      Array<{
        id: string;
        body: string | null;
        senderId: string;
        createdAt: Date;
        encrypted: boolean;
        envelope: unknown;
      }>
    >(
      `SELECT DISTINCT ON ("senderId") id, body, "senderId", "createdAt", encrypted, envelope FROM "Message" WHERE "recipientId" = $1::uuid AND "senderId" = ANY($2::uuid[]) ORDER BY "senderId", "createdAt" DESC`,
      userId,
      friendIds,
    );

    const latestPerPeer = new Map<
      string,
      { lastMessage: string | Record<string, unknown>; lastTime: Date }
    >();
    for (const msg of sentMessages)
      latestPerPeer.set(msg.recipientId, {
        lastMessage: msg.encrypted
          ? ((msg.envelope as Record<string, unknown>) ?? '')
          : (msg.body ?? ''),
        lastTime: msg.createdAt,
      });
    for (const msg of receivedMessages) {
      const existing = latestPerPeer.get(msg.senderId);
      if (!existing || msg.createdAt > existing.lastTime)
        latestPerPeer.set(msg.senderId, {
          lastMessage: msg.encrypted
            ? ((msg.envelope as Record<string, unknown>) ?? '')
            : (msg.body ?? ''),
          lastTime: msg.createdAt,
        });
    }

    const peerIds = Array.from(latestPerPeer.keys());
    const peerUsers = await this.prisma.user.findMany({
      where: { id: { in: peerIds } },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        hideAvatar: true,
      },
    });
    const userMap = new Map(peerUsers.map((u) => [u.id, u]));

    const result = peerIds
      .map((peerId) => {
        const latest = latestPerPeer.get(peerId)!;
        const user = userMap.get(peerId) ?? {
          id: peerId,
          email: 'unknown',
          name: null as string | null,
          avatarUrl: null as string | null,
          hideAvatar: false,
        };
        return {
          user: {
            ...this.redactAvatar(user, userId),
            name: displayName(user),
            avatar: initials(displayName(user)),
          },
          lastMessage: latest.lastMessage,
          lastTime: latest.lastTime,
          unread: unreadMap.get(peerId) ?? 0,
        };
      })
      .sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());

    await this.cache.set(cacheKey, result, 30);
    return result;
  }

  async getMessages(
    userId: string,
    otherUserId: string,
    areFriends: (a: string, b: string) => Promise<boolean>,
    before?: string,
    take = 30,
  ) {
    if (!(await areFriends(userId, otherUserId)))
      return { messages: [], hasMore: false };
    const where: Prisma.MessageWhereInput = {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    };
    if (before) where.createdAt = { lt: new Date(before) };
    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            hideAvatar: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            hideAvatar: true,
          },
        },
      },
    });
    const redacted = messages.map((m) => ({
      ...m,
      sender: this.redactAvatar(m.sender, userId),
      recipient: this.redactAvatar(m.recipient, userId),
    }));
    return { messages: redacted.reverse(), hasMore: messages.length === take };
  }

  async sendMessage(
    senderId: string,
    recipientId: string,
    text = '',
    areFriends: (a: string, b: string) => Promise<boolean>,
    friends?: string[],
    attachment?: MessageAttachment,
    envelope?: Record<string, unknown>,
  ) {
    if (senderId === recipientId) {
      this.logger.warn(`User ${senderId} attempted to message self`);
      throw new ForbiddenException('Cannot send message to yourself');
    }
    const isFriend = friends
      ? friends.includes(recipientId)
      : await areFriends(senderId, recipientId);
    if (!isFriend) {
      this.logger.warn(
        `User ${senderId} attempted to message non-friend ${recipientId}`,
      );
      throw new ForbiddenException('You can only send messages to friends');
    }
    const isEncrypted = envelope && typeof envelope === 'object';
    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        body: isEncrypted ? null : (text ?? ''),
        encrypted: isEncrypted,
        algVersion: isEncrypted ? ((envelope.v as number) ?? 1) : null,
        envelope: isEncrypted ? (envelope as Prisma.InputJsonValue) : undefined,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        attachmentName: attachment?.name,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            hideAvatar: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            hideAvatar: true,
          },
        },
      },
    });
    this.logger.log(
      `Message ${message.id} created: ${senderId} → ${recipientId}`,
    );
    await Promise.all([
      this.cache.del(`conversations:${senderId}`),
      this.cache.del(`conversations:${recipientId}`),
    ]);
    const { hideAvatar: _senderHideAvatar, ...senderRest } = message.sender;
    return {
      ...message,
      sender: {
        ...senderRest,
        avatar: initials(message.sender.name || message.sender.email),
      },
      recipient: this.redactAvatar(message.recipient, senderId),
    };
  }

  async deliverDirectMessage(message: {
    id: string;
    senderId: string;
    recipientId: string;
    body: string | Record<string, unknown> | null;
    encrypted?: boolean;
    envelope?: unknown;
    createdAt: Date;
    sender?: {
      id?: string;
      name?: string | null;
      email?: string;
      avatar?: string;
    };
  }) {
    const [unread, totalDmUnread] = await Promise.all([
      this.getUnreadCount(message.recipientId, message.senderId),
      this.getTotalUnreadCount(message.recipientId),
    ]);
    const senderName = displayName(message.sender ?? {});
    const senderAvatar = message.sender?.avatar ?? '';
    const senderEmail = message.sender?.email ?? '';

    // For encrypted messages, send the envelope as the conversation preview
    // so the client can decrypt it; for plaintext, send body as-is.
    const lastMessage = message.encrypted
      ? ((message.envelope as Record<string, unknown>) ?? message.body)
      : message.body;

    this.realtime.emitToService(message.recipientId, 'MESSAGE', {
      renew: 'Messages',
      type: 'Conversation',
      conversation: {
        user: {
          id: message.senderId,
          email: senderEmail,
          name: senderName,
          avatar: senderAvatar,
        },
        lastMessage,
        lastTime: message.createdAt,
        unread: unread + 1,
      },
    });
    this.realtime.emitToService(message.recipientId, 'NOTIFICATION', {
      renew: 'Notifications',
      type: 'DmCount',
      value: totalDmUnread,
    });
    this.realtime.emitToPage(message.recipientId, 'messages', {
      type: 'direct-message',
      message,
    });
    this.realtime.emitToPage(message.senderId, 'messages', {
      type: 'direct-message',
      message,
    });
    if (
      !this.realtime.hasServiceConnection(message.recipientId, 'MESSAGE') &&
      !this.realtime.hasServiceConnection(message.recipientId, 'NOTIFICATION')
    ) {
      // Encrypted messages: generic preview (no plaintext leak)
      // Plaintext messages: truncated body (legacy behavior)
      const pushBody = message.encrypted
        ? ''
        : typeof message.body === 'string'
          ? message.body
          : '';
      this.push
        .sendToUser(
          message.recipientId,
          `New message from ${senderName}`,
          pushBody.length > 120
            ? pushBody.slice(0, 117) + '...'
            : pushBody || 'New message',
          undefined,
          {
            kind: 'direct-message',
            senderId: message.senderId,
            dmCount: totalDmUnread,
          },
        )
        .catch((err: Error) =>
          this.logger.warn(`Offline push failed: ${err.message}`),
        );
    }
  }

  async getUnreadCount(userId: string, peerId: string): Promise<number> {
    return this.prisma.message.count({
      where: { senderId: peerId, recipientId: userId, readAt: null },
    });
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    return this.prisma.message.count({
      where: { recipientId: userId, readAt: null },
    });
  }

  async sendAndDeliverMessage(
    senderId: string,
    recipientId: string,
    text = '',
    areFriends: (a: string, b: string) => Promise<boolean>,
    friends?: string[],
    tempId?: string,
    attachment?: MessageAttachment,
    envelope?: Record<string, unknown>,
  ) {
    const message = await this.sendMessage(
      senderId,
      recipientId,
      text,
      areFriends,
      friends,
      attachment,
      envelope,
    );
    if (tempId) (message as Record<string, unknown>)._tempId = tempId;
    await this.deliverDirectMessage(message);
    return message;
  }

  async markConversationRead(
    readerId: string,
    peerId: string,
    getPeerDisplay?: (userId: string) => Promise<{
      id: string;
      email: string;
      name: string | null;
      avatar: string;
    }>,
  ) {
    const result = await this.markRead(readerId, peerId);
    this.realtime.emitToPage(peerId, 'messages', {
      type: 'message-read',
      readerId,
      senderId: peerId,
      readAt: result.readAt,
      peerId: readerId,
    });
    this.realtime.emitToService(peerId, 'MESSAGE', {
      type: 'message-read',
      readerId,
      senderId: peerId,
      readAt: result.readAt,
      peerId: readerId,
    });
    if (getPeerDisplay) {
      const peer = await getPeerDisplay(peerId);
      this.realtime.emitToService(readerId, 'MESSAGE', {
        renew: 'Messages',
        type: 'Conversation',
        conversation: { user: peer, unread: 0 },
      });
    }
    const totalDmUnread = await this.getTotalUnreadCount(readerId);
    this.realtime.emitToService(readerId, 'NOTIFICATION', {
      renew: 'Notifications',
      type: 'DmCount',
      value: totalDmUnread,
    });
    return result;
  }

  async markRead(userId: string, otherUserId: string) {
    const now = new Date();
    const result = await this.prisma.message.updateMany({
      where: { senderId: otherUserId, recipientId: userId, readAt: null },
      data: { readAt: now },
    });
    this.logger.log(
      `Marked ${result.count} messages as read from ${otherUserId} by ${userId}`,
    );
    await Promise.all([
      this.cache.del(`conversations:${userId}`),
      this.cache.del(`conversations:${otherUserId}`),
    ]);
    return { readAt: now.toISOString() };
  }
}
