import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { countLetters } from '../common/utils/letter-count';
import { UsageService } from '../usage/usage.service';
import {
  type RoomMember,
  type MessageAttachment,
  initials,
} from './messaging.types';
import { resolveAttachmentEnvelopes } from './attachment-envelopes.util';

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

export class MessagingRoomService {
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
  ) {
    void this.seedRooms().then(() => refreshDbRoomSlugs(this.prisma));
  }

  private async seedRooms(): Promise<void> {
    for (const slug of CHAT_ROOMS) {
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

  joinRoom(room: string, member: RoomMember) {
    if (!this.rooms.has(room)) this.rooms.set(room, new Map());
    this.rooms.get(room)!.set(member.socketId, member);
    void this.redis?.sadd(this.redisRoomKey(room), member.socketId);

    // Track userId refcount locally and in Redis.
    if (!this.userSocketCounts.has(room))
      this.userSocketCounts.set(room, new Map());
    const counts = this.userSocketCounts.get(room)!;
    counts.set(member.userId, (counts.get(member.userId) ?? 0) + 1);
    void this.redis?.sadd(this.redisUserKey(room), member.userId);

    return this.getRoomMembers(room);
  }

  leaveRoom(room: string, socketId: string) {
    const roomMap = this.rooms.get(room);
    if (roomMap) {
      const member = roomMap.get(socketId);
      roomMap.delete(socketId);
      void this.redis?.srem(this.redisRoomKey(room), socketId);

      // Decrement userId refcount; remove from Redis when last socket leaves.
      if (member) {
        const counts = this.userSocketCounts.get(room);
        if (counts) {
          const prev = counts.get(member.userId) ?? 0;
          if (prev <= 1) {
            counts.delete(member.userId);
            void this.redis?.srem(this.redisUserKey(room), member.userId);
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
        void this.redis?.srem(this.redisRoomKey(room), socketId);

        const counts = this.userSocketCounts.get(room);
        if (counts) {
          const prev = counts.get(member.userId) ?? 0;
          if (prev <= 1) {
            counts.delete(member.userId);
            void this.redis?.srem(this.redisUserKey(room), member.userId);
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
    body = '',
    attachments?: MessageAttachment[],
    envelope?: Record<string, unknown>,
  ) {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
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
    const storedAttachments = await resolveAttachmentEnvelopes(
      this.prisma,
      attachments ?? [],
    );
    return this.prisma.roomMessage
      .create({
        data: {
          roomId,
          senderId,
          v,
          ct,
          nonce,
          letterCount: countLetters(body),
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
          sender: { select: { name: true, email: true } },
          attachments: true,
        },
      })
      .then(async (row) => {
        // Link each attachment back to the room message it shipped in so the
        // upload is traceable from PendingUpload (kind/scopeId written at
        // upload time + roomMessageId backfilled here).
        if (row.attachments.length > 0) {
          await this.prisma.pendingUpload.updateMany({
            where: { url: { in: row.attachments.map((a) => a.url) } },
            data: { roomMessageId: row.id },
          });
        }
        return {
          ...row,
          attachments: row.attachments.map((a) =>
            this.storageCrypto.toWireAttachment(a),
          ),
        };
      });
  }

  async getRoomMessages(roomId: string, before?: string, take = 30) {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    const where: Prisma.RoomMessageWhereInput = { roomId };
    if (before) where.createdAt = { lt: new Date(before) };
    const messages = await this.prisma.roomMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        sender: { select: { name: true, email: true } },
        attachments: true,
      },
    });
    return {
      messages: messages.reverse().map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name || m.sender.email || 'Unknown',
        avatar: initials(m.sender.name || m.sender.email || 'Unknown'),
        v: m.v,
        ct: m.ct,
        nonce: m.nonce,
        attachments: m.attachments.map((a) =>
          this.storageCrypto.toWireAttachment(a),
        ),
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore: messages.length === take,
    };
  }
}
