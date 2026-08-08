import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { displayName } from '../common/utils/display-name';
import { countLetters } from '../common/utils/letter-count';
import { UsageService } from '../usage/usage.service';
import {
  DELETE_FOR_EVERYONE_WINDOW_MS,
  initials,
  type MessageAttachment,
} from './messaging.types';
import { resolveAttachmentEnvelopes } from './attachment-envelopes.util';

/** Sentinel `lastMessage` value for a tombstoned conversation preview —
 *  mirrors the existing `'[Encrypted]'` convention both frontends already
 *  special-case in the sidebar. */
export const DELETED_PREVIEW_SENTINEL = '[Deleted]';

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
        hasAttachments: boolean;
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

    // hasAttachments comes from a real join against MessageAttachment, not
    // from the decrypted envelope — attachments sent via a caller-supplied
    // client envelope aren't guaranteed to echo their metadata back out of
    // decryptPreview, so the DB relation is the only source both encryption
    // paths agree on.
    // Both queries bind $1 = userId (the viewer), so the same
    // deletion-exclusion clause — "hide anything I deleted for me" — applies
    // unchanged whether the viewer was the sender or the recipient of a given
    // row. Deleted-for-everyone rows are NOT excluded here (deletedAt stays
    // NULL-agnostic in the WHERE) — DISTINCT ON still picks them up as the
    // latest row, and the aggregation loop below renders them as a tombstone
    // preview instead of decrypting them.
    const sentMessages = await this.prisma.$queryRawUnsafe<
      Array<{
        id: string;
        recipientId: string;
        createdAt: Date;
        v: string;
        ct: string;
        nonce: string;
        deletedAt: Date | null;
        hasAttachments: boolean;
      }>
    >(
      `SELECT DISTINCT ON ("recipientId") id, "recipientId", "createdAt", v, ct, nonce, "deletedAt", EXISTS(SELECT 1 FROM "MessageAttachment" WHERE "messageId" = "Message"."id") AS "hasAttachments" FROM "Message" WHERE "senderId" = $1::uuid AND "recipientId" = ANY($2::uuid[]) AND NOT EXISTS (SELECT 1 FROM "MessageDeletion" md WHERE md."messageId" = "Message"."id" AND md."userId" = $1::uuid) ORDER BY "recipientId", "createdAt" DESC`,
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
        deletedAt: Date | null;
        hasAttachments: boolean;
      }>
    >(
      `SELECT DISTINCT ON ("senderId") id, "senderId", "createdAt", v, ct, nonce, "deletedAt", EXISTS(SELECT 1 FROM "MessageAttachment" WHERE "messageId" = "Message"."id") AS "hasAttachments" FROM "Message" WHERE "recipientId" = $1::uuid AND "senderId" = ANY($2::uuid[]) AND NOT EXISTS (SELECT 1 FROM "MessageDeletion" md WHERE md."messageId" = "Message"."id" AND md."userId" = $1::uuid) ORDER BY "senderId", "createdAt" DESC`,
      userId,
      friendIds,
    );

    const latestPerPeer = new Map<
      string,
      {
        lastMessage: string | Record<string, unknown>;
        lastTime: Date;
        hasAttachments: boolean;
      }
    >();
    for (const msg of sentMessages)
      latestPerPeer.set(msg.recipientId, {
        lastMessage: msg.deletedAt
          ? DELETED_PREVIEW_SENTINEL
          : this.decryptPreview(msg, userId),
        lastTime: msg.createdAt,
        hasAttachments: msg.deletedAt ? false : msg.hasAttachments,
      });
    for (const msg of receivedMessages) {
      const existing = latestPerPeer.get(msg.senderId);
      if (!existing || msg.createdAt > existing.lastTime)
        latestPerPeer.set(msg.senderId, {
          lastMessage: msg.deletedAt
            ? DELETED_PREVIEW_SENTINEL
            : this.decryptPreview(msg, userId),
          lastTime: msg.createdAt,
          hasAttachments: msg.deletedAt ? false : msg.hasAttachments,
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
          hasAttachments: latest.hasAttachments,
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
      // "Delete for me" rows are hidden from this viewer entirely — never
      // returned, not even as a tombstone (only the deleting viewer's own
      // deletion is checked; the peer's copy of the message is untouched).
      deletions: { none: { userId } },
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
      // "Delete for everyone" rows stay in the list (both parties keep
      // seeing a tombstone at the right point in the thread) but never
      // expose attachments — the body itself is stripped later by
      // decryptMessageBody, which every caller of getMessages already runs.
      attachments: m.deletedAt
        ? []
        : m.attachments.map((a) => this.storageCrypto.toWireAttachment(a)),
      sender: this.redactAvatar(m.sender, userId),
      recipient: this.redactAvatar(m.recipient, userId),
    }));
    return { messages: redacted.reverse(), hasMore: messages.length === take };
  }

  /**
   * Every file ever exchanged in this conversation, newest first. Queries
   * `MessageAttachment` directly (not `PendingUpload` — for DMs its
   * `scopeId` is the uploader's own id, not the conversation, so it can't
   * answer "everything exchanged with this peer"). Explicit `select` keeps
   * the ciphertext columns (`ct` duplicates the full file bytes) off the
   * wire; unlike `getMessages`, results are returned newest-first as-is —
   * this is a flat gallery list, not a bottom-anchored chat scroll.
   */
  async getConversationAttachments(
    userId: string,
    otherUserId: string,
    areFriends: (a: string, b: string) => Promise<boolean>,
    before?: string,
    take = 30,
  ) {
    if (!(await areFriends(userId, otherUserId)))
      return { attachments: [], hasMore: false };
    const where: Prisma.MessageAttachmentWhereInput = {
      message: {
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
        // A deleted photo shouldn't still show up in the media gallery,
        // whether it was deleted for everyone or just for this viewer.
        deletedAt: null,
        deletions: { none: { userId } },
      },
    };
    if (before) where.createdAt = { lt: new Date(before) };
    const attachments = await this.prisma.messageAttachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
        type: true,
        name: true,
        size: true,
        createdAt: true,
        messageId: true,
      },
    });
    return { attachments, hasMore: attachments.length === take };
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
                  thumbnailUrl: a.thumbnailUrl ?? null,
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
    // Trace which persisted message each attachment was finally attached to —
    // the PendingUpload row is the upload-time record, this links it to the
    // message so uploads are traceable from the DB end-to-end.
    if (storedAttachments.length > 0) {
      await this.prisma.pendingUpload.updateMany({
        where: { url: { in: storedAttachments.map((a) => a.url) } },
        data: { messageId: message.id },
      });
    }
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
        hasAttachments: (message.attachments?.length ?? 0) > 0,
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

  /**
   * Recomputes what the sidebar preview for `peerId` should look like from
   * `viewerId`'s perspective — used after a deletion may have changed which
   * message is now the latest visible one. A real Prisma query (not raw
   * SQL): this only runs on the low-QPS delete path, not the hot
   * conversations list, so `deletions: { none: { userId } }`'s ergonomics
   * matter more here than raw-SQL performance.
   */
  private async getLatestPreviewForPeer(
    viewerId: string,
    peerId: string,
  ): Promise<{
    lastMessage: string;
    lastTime: Date;
    hasAttachments: boolean;
  } | null> {
    const msg = await this.prisma.message.findFirst({
      where: {
        OR: [
          { senderId: viewerId, recipientId: peerId },
          { senderId: peerId, recipientId: viewerId },
        ],
        deletions: { none: { userId: viewerId } },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        v: true,
        ct: true,
        nonce: true,
        senderId: true,
        createdAt: true,
        deletedAt: true,
        _count: { select: { attachments: true } },
      },
    });
    if (!msg) return null;
    return {
      lastMessage: msg.deletedAt
        ? DELETED_PREVIEW_SENTINEL
        : this.decryptPreview(msg, viewerId),
      lastTime: msg.createdAt,
      hasAttachments: msg.deletedAt ? false : msg._count.attachments > 0,
    };
  }

  /**
   * "Delete for me" — hides this message only for `userId`, permanently and
   * across every device/tab of theirs (server-persisted, not a client-local
   * hide). Never visible to, or affects, the other party in any way. No
   * sender/recipient asymmetry, no time window, idempotent (upsert).
   */
  async deleteMessageForMe(
    userId: string,
    messageId: string,
  ): Promise<{ id: string }> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      select: { id: true, senderId: true, recipientId: true },
    });
    if (!message) throw new NotFoundException('Message not found');
    const peerId =
      message.senderId === userId ? message.recipientId : message.senderId;

    await this.prisma.messageDeletion.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: {},
    });
    // Only the actor's own conversation list can have changed.
    await this.cache.del(`conversations:${userId}`);

    const preview = await this.getLatestPreviewForPeer(userId, peerId);
    this.realtime.emitToService(
      userId,
      'MESSAGE',
      preview
        ? {
            renew: 'Messages',
            type: 'Conversation',
            conversation: { user: { id: peerId }, ...preview },
          }
        : // Edge case: no visible messages left with this peer at all.
          { renew: 'Messages', type: 'ConversationRemoved', peerId },
    );

    // Multi-device/multi-tab sync for the ACTOR only — this frame never
    // reaches the peer, who still sees the message exactly as before.
    await this.realtime.emitToUserEncrypted(userId, {
      type: 'message-deleted',
      scope: 'me',
      messageId,
      peerId,
    });
    return { id: messageId };
  }

  /**
   * "Delete for everyone" — sender-only, and only within
   * DELETE_FOR_EVERYONE_WINDOW_MS of sending. Soft-hide only: v/ct/nonce and
   * attachment rows/files are left exactly as they are at rest; this just
   * flags the row so every read path (decryptMessageBody, getMessages,
   * getConversations) stops surfacing its content from this point on.
   * Idempotent — a second call on an already-tombstoned message is a
   * harmless no-op rather than an error, so retries/double-clicks are safe.
   */
  async deleteMessageForEveryone(
    userId: string,
    messageId: string,
  ): Promise<{ id: string; deletedAt: string }> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        createdAt: true,
        deletedAt: true,
      },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'Only the sender can delete this message for everyone',
      );
    }
    if (
      !message.deletedAt &&
      Date.now() - message.createdAt.getTime() > DELETE_FOR_EVERYONE_WINDOW_MS
    ) {
      throw new ForbiddenException('Delete window has expired');
    }

    const deletedAt = message.deletedAt ?? new Date();
    if (!message.deletedAt) {
      await this.prisma.message.update({
        where: { id: messageId },
        data: { deletedAt },
      });
    }
    await Promise.all([
      this.cache.del(`conversations:${message.senderId}`),
      this.cache.del(`conversations:${message.recipientId}`),
    ]);

    // Both parties get the same frame — mirrors how deliverDirectMessage
    // fans a new message out to both sides; each client derives whether
    // it's the sender or the peer from senderId/recipientId.
    const frame = {
      type: 'message-deleted',
      scope: 'everyone',
      messageId,
      senderId: message.senderId,
      recipientId: message.recipientId,
      deletedAt: deletedAt.toISOString(),
    };
    await this.realtime.emitToUserEncrypted(message.senderId, frame);
    await this.realtime.emitToUserEncrypted(message.recipientId, frame);

    for (const [viewer, peer] of [
      [message.senderId, message.recipientId],
      [message.recipientId, message.senderId],
    ] as const) {
      const preview = await this.getLatestPreviewForPeer(viewer, peer);
      if (preview) {
        this.realtime.emitToService(viewer, 'MESSAGE', {
          renew: 'Messages',
          type: 'Conversation',
          conversation: { user: { id: peer }, ...preview },
        });
      }
    }
    return { id: messageId, deletedAt: deletedAt.toISOString() };
  }
}
