import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { countLetters } from '../common/utils/letter-count';
import { UsageService } from '../usage/usage.service';
import { tierRank, MIN_TIER_FOR_VIP } from '../authorization/tier-rank';
import {
  DELETE_FOR_EVERYONE_WINDOW_MS,
  type RoomMember,
  type MessageAttachment,
  initials,
} from './messaging.types';
import { resolveAttachmentEnvelopes } from './attachment-envelopes.util';
import { buildReplyPreview } from './message-body.util';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const ROOM_MEMBERS_PREFIX = 'room:';

export const CHAT_ROOMS = [
  'general',
  'random',
  'tech',
  'design',
  'music',
] as const;
export type ChatRoom = (typeof CHAT_ROOMS)[number];
export const VIP_ROOM_PREFIX = 'vip-';
// The one VIP room both frontend and mobile hardcode as joinable. isValidRoom()
// already accepts any `vip-`-prefixed slug and hasRoomTierAccess() already
// gates it correctly by prefix alone — this list exists solely so seedRooms()
// creates the backing Room row (a real FK target for RoomMessage.roomId),
// which nothing previously did.
export const VIP_ROOMS = ['vip-lounge'] as const;

/**
 * Cache of DB-registered room slugs (Room.slug), refreshed from Postgres.
 * isValidRoom() stays synchronous for its callers on the WS hot path (every
 * join/leave/send goes through it), so this is populated by a background
 * refresh (kicked off from MessagingRoomService's constructor and re-run
 * whenever membership is mutated) rather than queried inline.
 */
let dbRoomSlugs = new Set<string>();

export async function refreshDbRoomSlugs(prisma: PrismaService): Promise<void> {
  const rooms = await prisma.room.findMany({ select: { slug: true } });
  dbRoomSlugs = new Set(rooms.map((r) => r.slug));
}

export function isValidRoom(room: string): boolean {
  return (
    CHAT_ROOMS.includes(room as ChatRoom) ||
    room.startsWith(VIP_ROOM_PREFIX) ||
    dbRoomSlugs.has(room)
  );
}

/**
 * Single source of truth for the VIP tier gate, shared by every place a room
 * is joined, read, or written to (WS gateway's roomJoinError, the REST/WS
 * read paths, saveRoomMessage, and /upload/serve's attachment ownership
 * check) so the gate can't drift out of sync between them again.
 */
export function hasRoomTierAccess(
  room: string,
  tier: string | undefined,
): boolean {
  return (
    !room.startsWith(VIP_ROOM_PREFIX) ||
    tierRank(tier ?? 'FREE') >= MIN_TIER_FOR_VIP
  );
}

export class MessagingRoomService {
  private readonly logger = new Logger(MessagingRoomService.name);

  /**
   * Chat-room membership uses Redis Sets as the authoritative source for
   * user IDs (cross-instance safe). The in-memory Map stores full
   * RoomMember objects for local display (names, avatars) and reference
   * counting (socketCount per userId).
   */
  private rooms = new Map<string, Map<string, RoomMember>>();
  /** Per-room userId → number of local sockets (for refcounted leave). */
  private userSocketCounts = new Map<string, Map<string, number>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis | null,
    private readonly storageCrypto: StorageCryptoService,
    private readonly usage: UsageService,
    private readonly realtime: RealtimeGateway,
  ) {
    // This app has no process-level unhandledRejection/uncaughtException
    // handler, so an unguarded rejection here (very plausible right after a
    // container restart, before Postgres is fully ready to accept
    // connections) previously crashed the process before it served any
    // traffic, on every boot. Retries with a short backoff instead of
    // crashing OR silently giving up — a few attempts covers "Postgres
    // isn't ready yet" without hanging startup if it's genuinely down.
    void this.seedRoomsWithRetry();
  }

  private async seedRoomsWithRetry(attempt = 1): Promise<void> {
    const MAX_ATTEMPTS = 5;
    const RETRY_DELAY_MS = 2000;
    try {
      await this.seedRooms();
      await refreshDbRoomSlugs(this.prisma);
    } catch (err) {
      const error = err as Error;
      if (attempt >= MAX_ATTEMPTS) {
        this.logger.error(
          `Room seeding failed after ${MAX_ATTEMPTS} attempts — chat-room messaging will fail until this succeeds (next restart or a future call): ${error.message}`,
        );
        return;
      }
      this.logger.warn(
        `Room seeding failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${RETRY_DELAY_MS}ms: ${error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      await this.seedRoomsWithRetry(attempt + 1);
    }
  }

  private async seedRooms(): Promise<void> {
    for (const slug of [...CHAT_ROOMS, ...VIP_ROOMS]) {
      await this.prisma.room.upsert({
        where: { slug },
        update: {},
        create: { slug },
      });
    }
  }

  async listRooms(): Promise<{ slug: string }[]> {
    return this.prisma.room.findMany({
      select: { slug: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  private redisRoomKey(room: string): string {
    return `${ROOM_MEMBERS_PREFIX}${room}:members`;
  }

  private redisUserKey(room: string): string {
    return `${ROOM_MEMBERS_PREFIX}${room}:userIds`;
  }

  /**
   * Fire-and-forget Redis calls throughout this file previously had no
   * `.catch()` at all — an ioredis rejection (auth error, maxmemory,
   * cluster failover) is an unhandled promise rejection with no
   * process-level handler anywhere in this app, which crashes the whole
   * process by default. `realtime.gateway.ts` already wraps its own
   * equivalent fire-and-forget Redis calls the same way, via its
   * `safeRedis` helper — this mirrors that.
   */
  private safeRedis(label: string, promise: Promise<unknown> | undefined) {
    promise?.catch((err: Error) => {
      this.logger.warn(`Redis ${label} failed: ${err.message}`);
    });
  }

  joinRoom(room: string, member: RoomMember) {
    if (!this.rooms.has(room)) this.rooms.set(room, new Map());
    this.rooms.get(room)!.set(member.socketId, member);
    this.safeRedis(
      'sadd:roomMembers',
      this.redis?.sadd(this.redisRoomKey(room), member.socketId),
    );

    // Track userId refcount locally and in Redis.
    if (!this.userSocketCounts.has(room))
      this.userSocketCounts.set(room, new Map());
    const counts = this.userSocketCounts.get(room)!;
    counts.set(member.userId, (counts.get(member.userId) ?? 0) + 1);
    this.safeRedis(
      'sadd:roomUserIds',
      this.redis?.sadd(this.redisUserKey(room), member.userId),
    );

    return this.getRoomMembers(room);
  }

  leaveRoom(room: string, socketId: string) {
    const roomMap = this.rooms.get(room);
    if (roomMap) {
      const member = roomMap.get(socketId);
      roomMap.delete(socketId);
      this.safeRedis(
        'srem:roomMembers',
        this.redis?.srem(this.redisRoomKey(room), socketId),
      );

      // Decrement userId refcount; remove from Redis when last socket leaves.
      if (member) {
        const counts = this.userSocketCounts.get(room);
        if (counts) {
          const prev = counts.get(member.userId) ?? 0;
          if (prev <= 1) {
            counts.delete(member.userId);
            this.safeRedis(
              'srem:roomUserIds',
              this.redis?.srem(this.redisUserKey(room), member.userId),
            );
          } else {
            counts.set(member.userId, prev - 1);
          }
        }
      }

      if (roomMap.size === 0) this.rooms.delete(room);
    }
    return this.getRoomMembers(room);
  }

  leaveAllRooms(socketId: string): string[] {
    const affected: string[] = [];
    for (const [room, members] of this.rooms) {
      if (members.has(socketId)) {
        const member = members.get(socketId)!;
        members.delete(socketId);
        affected.push(room);
        this.safeRedis(
          'srem:roomMembers',
          this.redis?.srem(this.redisRoomKey(room), socketId),
        );

        const counts = this.userSocketCounts.get(room);
        if (counts) {
          const prev = counts.get(member.userId) ?? 0;
          if (prev <= 1) {
            counts.delete(member.userId);
            this.safeRedis(
              'srem:roomUserIds',
              this.redis?.srem(this.redisUserKey(room), member.userId),
            );
          } else {
            counts.set(member.userId, prev - 1);
          }
        }

        if (members.size === 0) this.rooms.delete(room);
      }
    }
    return affected;
  }

  getRoomCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [room, members] of this.rooms) {
      const unique = new Set<string>();
      for (const m of members.values()) unique.add(m.userId);
      counts[room] = unique.size;
    }
    return counts;
  }

  getRoomMembers(room: string): RoomMember[] {
    const roomMap = this.rooms.get(room);
    if (!roomMap) return [];
    const seen = new Set<string>();
    const result: RoomMember[] = [];
    for (const m of roomMap.values()) {
      if (seen.has(m.userId)) continue;
      seen.add(m.userId);
      result.push(m);
    }
    return result;
  }

  /**
   * Returns userIds of all members in a room across ALL instances.
   * Merges local in-memory members (always up-to-date on this instance)
   * with the Redis Set (cross-instance safety).  If Redis is down or the
   * SET hasn't been populated yet, the local Map is the fallback.
   */
  async getRoomUserIds(room: string): Promise<string[]> {
    const localIds = this.getRoomMembers(room).map((m) => m.userId);
    if (!this.redis) return localIds;
    try {
      const remoteIds = await this.redis.smembers(this.redisUserKey(room));
      return [...new Set([...localIds, ...remoteIds])];
    } catch {
      return localIds;
    }
  }

  async persistJoin(roomSlug: string, userId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { slug: roomSlug },
      select: { id: true },
    });
    if (!room) return;

    await this.prisma.$transaction([
      this.prisma.roomParticipant.upsert({
        where: { roomId_userId: { roomId: room.id, userId } },
        update: { leftAt: null, joinedAt: new Date() },
        create: { roomId: room.id, userId },
      }),
      this.prisma.room.update({
        where: { id: room.id },
        data: { membershipVersion: { increment: 1 } },
      }),
    ]);
  }

  async persistLeave(roomSlug: string, userId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { slug: roomSlug },
      select: { id: true },
    });
    if (!room) return;

    await this.prisma.$transaction([
      this.prisma.roomParticipant.updateMany({
        where: { roomId: room.id, userId, leftAt: null },
        data: { leftAt: new Date() },
      }),
      this.prisma.room.update({
        where: { id: room.id },
        data: { membershipVersion: { increment: 1 } },
      }),
    ]);
  }

  async saveRoomMessage(
    roomId: string,
    senderId: string,
    tier: string | undefined,
    body = '',
    attachments?: MessageAttachment[],
    envelope?: Record<string, unknown>,
    replyToId?: string,
  ) {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    if (!hasRoomTierAccess(roomId, tier))
      throw new ForbiddenException('VIP rooms require MEDIUM tier or above');
    // Same rule as DMs (CROSS-024): a replyToId must point at a message in
    // THIS room, or a crafted id could quote a decrypted preview out of a
    // VIP room into a public one.
    let validReplyToId: string | undefined;
    if (replyToId) {
      const target = await this.prisma.roomMessage.findUnique({
        where: { id: replyToId },
        select: { id: true, roomId: true },
      });
      if (!target || target.roomId !== roomId) {
        throw new ForbiddenException(
          'Cannot reply to a message outside this room',
        );
      }
      validReplyToId = replyToId;
    }
    await this.usage.assertCanSendMessage(senderId, countLetters(body));
    // Room messages are ALWAYS stored encrypted: a caller-supplied envelope
    // is flattened into the v/ct/nonce columns as-is, otherwise the server
    // encrypts the plaintext with the shared room key — a plaintext body row
    // is impossible.
    const envelopeFields = this.storageCrypto.flattenEnvelope(envelope);
    const { v, ct, nonce } =
      envelopeFields ??
      this.storageCrypto.encryptForRoom({
        text: body,
        attachments,
      });
    // Attachment envelopes come from the server-side upload store, not the
    // client frame (the full-file ciphertext must never ride the WS).
    const { attachments: storedAttachments, ownedUrls } =
      await resolveAttachmentEnvelopes(
        this.prisma,
        attachments ?? [],
        senderId,
        {
          kind: 'CHAT_ROOM',
          scopeId: roomId,
        },
      );
    // The message row and the PendingUpload relink must commit together —
    // previously these were two separate top-level writes (create, then a
    // trailing .then() doing the relink). PendingUpload's own access-control
    // gate (see upload.controller.ts's assertCanAccessUpload) treats
    // uploadedBy-only rows as visible to the uploader alone, so if the relink
    // never landed (crash, transient DB error), the message still saved and
    // rendered for the sender, but every OTHER room member got a 404 trying
    // to view the attachment — an image silently broken for its actual
    // audience. Failing the whole send instead is the recoverable outcome:
    // the sender sees an error and can just retry.
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.roomMessage.create({
        data: {
          roomId,
          senderId,
          v,
          ct,
          nonce,
          letterCount: countLetters(body),
          replyToId: validReplyToId ?? null,
          attachments:
            storedAttachments.length > 0
              ? {
                  create: storedAttachments.map((a) => ({
                    url: a.url,
                    type: a.type,
                    name: a.name,
                    size: a.size,
                    thumbnailUrl: a.thumbnailUrl ?? null,
                  })),
                }
              : undefined,
        },
        include: {
          sender: { select: { name: true, email: true } },
          attachments: true,
          replyTo: {
            include: {
              attachments: true,
              sender: { select: { name: true, email: true } },
            },
          },
        },
      });
      // Link each attachment back to the room message it shipped in so the
      // upload is traceable from PendingUpload (kind/scopeId written at
      // upload time + roomMessageId backfilled here). `ownedUrls` (not a
      // derivation from row.attachments) is the relink set — see
      // resolveAttachmentEnvelopes' ownership check.
      if (ownedUrls.length > 0) {
        await tx.pendingUpload.updateMany({
          where: { url: { in: ownedUrls } },
          data: { roomMessageId: created.id },
        });
      }
      return created;
    });
    return {
      ...row,
      attachments: row.attachments.map((a) =>
        this.storageCrypto.toWireAttachment(a),
      ),
      // Ready-to-send quote preview (decrypted with the room key) so the WS
      // broadcast can carry it without the gateway needing StorageCrypto.
      replyTo: this.toReplyPreview(row.replyTo, senderId),
    };
  }

  /**
   * Wire-format a one-level `replyTo` relation into the same ReplyPreview
   * shape DMs use: tombstoned quotes lose their attachments, and the body is
   * decrypted (room key first) by buildReplyPreview.
   */
  private toReplyPreview(
    replyTo:
      | (Record<string, unknown> & {
          deletedAt: Date | null;
          attachments: Parameters<StorageCryptoService['toWireAttachment']>[0][];
          sender?: { name: string | null; email: string | null } | null;
        })
      | null
      | undefined,
    viewerId: string,
  ) {
    if (!replyTo) return null;
    const { sender, ...row } = replyTo;
    const preview = buildReplyPreview(
      {
        ...row,
        attachments: replyTo.deletedAt
          ? []
          : replyTo.attachments.map((a) =>
              this.storageCrypto.toWireAttachment(a),
            ),
      },
      viewerId,
      this.storageCrypto,
    );
    if (!preview) return null;
    // Rooms have many senders, so (unlike a 2-party DM) the quote needs the
    // quoted author's display name on the wire.
    return {
      ...preview,
      senderName: sender?.name || sender?.email || 'Unknown',
    };
  }

  async getRoomMessages(
    roomId: string,
    tier: string | undefined,
    before?: string,
    take = 30,
    viewerId?: string,
  ) {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    if (!hasRoomTierAccess(roomId, tier))
      throw new ForbiddenException('VIP rooms require MEDIUM tier or above');
    const where: Prisma.RoomMessageWhereInput = { roomId };
    if (before) where.createdAt = { lt: new Date(before) };
    // "Delete for me" rows hide the message from this viewer's history only.
    if (viewerId) where.deletions = { none: { userId: viewerId } };
    const messages = await this.prisma.roomMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        sender: { select: { name: true, email: true } },
        attachments: true,
        replyTo: {
          include: {
            attachments: true,
            sender: { select: { name: true, email: true } },
          },
        },
      },
    });
    return {
      messages: messages.reverse().map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name || m.sender.email || 'Unknown',
        avatar: initials(m.sender.name || m.sender.email || 'Unknown'),
        // Tombstoned rows ship no ciphertext/attachments — same contract as
        // DM getMessages; the client renders "This message was deleted".
        ...(m.deletedAt
          ? { body: null }
          : { v: m.v, ct: m.ct, nonce: m.nonce }),
        attachments: m.deletedAt
          ? []
          : m.attachments.map((a) => this.storageCrypto.toWireAttachment(a)),
        deletedAt: m.deletedAt ? m.deletedAt.toISOString() : null,
        replyTo: this.toReplyPreview(m.replyTo, viewerId ?? m.senderId),
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore: messages.length === take,
    };
  }

  /**
   * "Delete for me" for a room message — server-persisted per viewer (see
   * RoomMessageDeletion), so it survives reloads and the viewer's other
   * devices. Nobody else in the room is affected. Mirrors
   * MessagingDmService.deleteMessageForMe.
   */
  async deleteRoomMessageForMe(
    userId: string,
    roomId: string,
    messageId: string,
  ): Promise<{ id: string }> {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    const message = await this.prisma.roomMessage.findFirst({
      where: { id: messageId, roomId },
      select: { id: true },
    });
    if (!message) throw new NotFoundException('Message not found');
    await this.prisma.roomMessageDeletion.upsert({
      where: { roomMessageId_userId: { roomMessageId: messageId, userId } },
      create: { roomMessageId: messageId, userId },
      update: {},
    });
    // Multi-device/multi-tab sync for the ACTOR only.
    await this.realtime.emitToUserEncrypted(userId, {
      type: 'room-message-deleted',
      scope: 'me',
      room: roomId,
      messageId,
    });
    return { id: messageId };
  }

  /**
   * "Delete for everyone" — sender-only, within DELETE_FOR_EVERYONE_WINDOW_MS
   * of sending, soft-hide only (ciphertext + attachment rows stay at rest),
   * idempotent. Every room member gets one `room-message-deleted` frame.
   */
  async deleteRoomMessageForEveryone(
    userId: string,
    roomId: string,
    messageId: string,
  ): Promise<{ id: string; deletedAt: string }> {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    const message = await this.prisma.roomMessage.findFirst({
      where: { id: messageId, roomId },
      select: { id: true, senderId: true, createdAt: true, deletedAt: true },
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
      await this.prisma.roomMessage.update({
        where: { id: messageId },
        data: { deletedAt },
      });
    }
    await this.realtime.emitToRoomEncrypted(roomId, {
      type: 'room-message-deleted',
      scope: 'everyone',
      room: roomId,
      messageId,
      senderId: message.senderId,
      deletedAt: deletedAt.toISOString(),
    });
    return { id: messageId, deletedAt: deletedAt.toISOString() };
  }

  /**
   * Every file ever shared in this room, newest first. Queries
   * RoomMessageAttachment (not MessageAttachment — rooms have their own
   * attachment table, joined through roomMessage.roomId) with an explicit
   * select to keep ciphertext columns off the wire, mirroring
   * MessagingDmService.getConversationAttachments. Gated the same way as
   * getRoomMessages above: valid room, and sufficient tier for vip- rooms.
   */
  async getRoomAttachments(
    roomId: string,
    tier: string | undefined,
    before?: string,
    take = 30,
    search?: string,
    from?: string,
    to?: string,
  ) {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    if (!hasRoomTierAccess(roomId, tier))
      throw new ForbiddenException('VIP rooms require MEDIUM tier or above');
    const where: Prisma.RoomMessageAttachmentWhereInput = {
      roomMessage: { roomId },
    };
    if (before || from || to) {
      where.createdAt = {
        ...(before && { lt: new Date(before) }),
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const attachments = await this.prisma.roomMessageAttachment.findMany({
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
        roomMessageId: true,
      },
    });
    return { attachments, hasMore: attachments.length === take };
  }
}
