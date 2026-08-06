import { ForbiddenException, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { displayName } from '../common/utils/display-name';
import { countLetters } from '../common/utils/letter-count';
import { UsageService } from '../usage/usage.service';
import { initials, type MessageAttachment } from './messaging.types';
import { resolveAttachmentEnvelopes } from './attachment-envelopes.util';

export class MessagingDmService {
  private readonly logger = new Logger(MessagingDmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheAsideService,
    private readonly realtime: RealtimeGateway,
    private readonly push: PushNotificationService,
    private readonly storageCrypto: StorageCryptoService,
    private readonly usage: UsageService,
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

  /** Every message is stored encrypted (v/ct/nonce columns, no plaintext
   *  body at rest), so the preview is always recovered from the storage
   *  envelope — room key first, then the sender's per-user key, then the
   *  reader's (legacy DM envelopes). */
  private decryptPreview(
    msg: {
      v: string | null;
      ct: string | null;
      nonce: string | null;
      senderId?: string;
    },
    userId: string,
  ): string {
    const envelope = this.storageCrypto.toEnvelope(msg);
    if (!envelope) return '';
    try {
      const decrypted = this.storageCrypto.decryptForRoom(envelope) as {
        text?: string;
      };
      return decrypted.text ?? '';
    } catch {}
    try {
      const senderId = msg.senderId || userId;
      const decrypted = this.storageCrypto.decryptFromStorage(
        senderId,
        envelope,
      ) as { text?: string };
      return decrypted.text ?? '';
    } catch {}
    try {
      const decrypted = this.storageCrypto.decryptFromStorage(
        userId,
        envelope,
      ) as { text?: string };
      return decrypted.text ?? '';
    } catch {}
    return '';
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
        recipientId: string;
        createdAt: Date;
        v: string;
        ct: string;
        nonce: string;
      }>
    >(
      `SELECT DISTINCT ON ("recipientId") id, "recipientId", "createdAt", v, ct, nonce FROM "Message" WHERE "senderId" = $1::uuid AND "recipientId" = ANY($2::uuid[]) ORDER BY "recipientId", "createdAt" DESC`,
      userId,
      friendIds,
    );
    const receivedMessages = await this.prisma.$queryRawUnsafe<
      Array<{
        id: string;
        senderId: string;
        createdAt: Date;
        v: string;
        ct: string;
        nonce: string;
      }>
    >(
      `SELECT DISTINCT ON ("senderId") id, "senderId", "createdAt", v, ct, nonce FROM "Message" WHERE "recipientId" = $1::uuid AND "senderId" = ANY($2::uuid[]) ORDER BY "senderId", "createdAt" DESC`,
      userId,
      friendIds,
    );

    const latestPerPeer = new Map<
      string,
      { lastMessage: string | Record<string, unknown>; lastTime: Date }
    >();
    for (const msg of sentMessages)
      latestPerPeer.set(msg.recipientId, {
        lastMessage: this.decryptPreview(msg, userId),
        lastTime: msg.createdAt,
      });
    for (const msg of receivedMessages) {
      const existing = latestPerPeer.get(msg.senderId);
      if (!existing || msg.createdAt > existing.lastTime)
        latestPerPeer.set(msg.senderId, {
          lastMessage: this.decryptPreview(msg, userId),
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
        attachments: true,
      },
    });
    const redacted = messages.map((m) => ({
      ...m,
      attachments: m.attachments.map((a) =>
        this.storageCrypto.toWireAttachment(a),
      ),
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
    attachments?: MessageAttachment[],
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
    await this.usage.assertCanSendMessage(senderId, countLetters(text));
    // Messages are ALWAYS stored encrypted: a caller-supplied envelope is
    // flattened into the v/ct/nonce columns as-is (client-side E2EE), and
    // when none is provided the server encrypts the plaintext itself — a
    // plaintext body row is impossible.
    const envelopeFields = this.storageCrypto.flattenEnvelope(envelope);
    const { v, ct, nonce } =
      envelopeFields ??
      this.storageCrypto.encryptForStorage(senderId, {
        text,
        attachments,
      });
    // Attachment envelopes come from the server-side upload store, not the
    // client frame (the full-file ciphertext must never ride the WS).
    const storedAttachments = await resolveAttachmentEnvelopes(
      this.prisma,
      attachments ?? [],
    );
    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        v,
        ct,
        nonce,
        letterCount: countLetters(text),
        attachments:
          storedAttachments.length > 0
            ? {
                create: storedAttachments.map((a) => ({
                  url: a.url,
                  type: a.type,
                  name: a.name,
                  size: a.size,
                  v: a.storageEnvelope?.v ?? null,
                  ct: a.storageEnvelope?.ct ?? null,
                  nonce: a.storageEnvelope?.nonce ?? null,
                })),
              }
            : undefined,
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
        attachments: true,
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
      attachments: message.attachments.map((a) =>
        this.storageCrypto.toWireAttachment(a),
      ),
      sender: {
        ...senderRest,
        avatar: initials(message.sender.name || message.sender.email),
      },
      recipient: this.redactAvatar(message.recipient, senderId),
    };
  }

  async deliverDirectMessage(
    message: {
      id: string;
      senderId: string;
      recipientId: string;
      createdAt: Date;
      sender?: {
        id?: string;
        name?: string | null;
        email?: string;
        avatar?: string;
      };
      attachments?: {
        url: string;
        type: string;
        name: string;
        size?: number;
        storageEnvelope?: { v: string; nonce: string; ct?: string } | null;
      }[];
      _tempId?: string;
    },
    deliveryPlaintext?: { text?: string; attachments?: unknown },
  ): Promise<{
    recipientPayload: Record<string, unknown>;
    senderPayload: Record<string, unknown>;
  }> {
    const [unread, totalDmUnread] = await Promise.all([
      this.getUnreadCount(message.recipientId, message.senderId),
      this.getTotalUnreadCount(message.recipientId),
    ]);
    const senderName = displayName(message.sender ?? {});
    const senderAvatar = message.sender?.avatar ?? '';
    const senderEmail = message.sender?.email ?? '';

    // Preview: the server is the trusted decryptor of the storage envelope,
    // so the plaintext preview comes from the delivery payload.
    const lastMessage = deliveryPlaintext?.text ?? '';

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

    // Page-scoped payloads — the gateway encrypts these per-connection.
    // Include the plaintext body so the recipient can display it directly
    // after wire-decryption (no need to decrypt the storage envelope). All
    // messages are stored encrypted; the body here is the decrypted
    // plaintext delivered by the trusted server.
    const baseMessage: Record<string, unknown> = {
      id: message.id,
      senderId: message.senderId,
      recipientId: message.recipientId,
      sender: message.sender,
      body: deliveryPlaintext?.text ?? null,
      createdAt: message.createdAt,
      ...(message._tempId ? { _tempId: message._tempId } : {}),
      ...(message.attachments && message.attachments.length > 0
        ? { attachments: message.attachments }
        : {}),
    };

    if (
      !this.realtime.hasServiceConnection(message.recipientId, 'MESSAGE') &&
      !this.realtime.hasServiceConnection(message.recipientId, 'NOTIFICATION')
    ) {
      const pushBody = deliveryPlaintext?.text ?? '';
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

    return {
      recipientPayload: { type: 'direct-message', message: baseMessage },
      senderPayload: { type: 'direct-message', message: baseMessage },
    };
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
    attachments?: MessageAttachment[],
    storageEnvelope?: Record<string, unknown>,
    deliveryPlaintext?: { text?: string; attachments?: unknown },
  ) {
    const message = await this.sendMessage(
      senderId,
      recipientId,
      text,
      areFriends,
      friends,
      attachments,
      storageEnvelope,
    );
    if (tempId) (message as Record<string, unknown>)._tempId = tempId;
    const delivery = await this.deliverDirectMessage(
      message,
      deliveryPlaintext,
    );
    return { message, delivery };
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
