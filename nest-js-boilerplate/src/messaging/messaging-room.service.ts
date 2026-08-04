import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import {
  type RoomMember,
  type MessageAttachment,
  initials,
} from './messaging.types';

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
  ) {
    void this.seedRooms().then(() =>
      refreshDbRoomSlugs(this.prisma),
    );
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
   * Uses the Redis Set as the source of truth for cross-instance safety.
   */
  async getRoomUserIds(room: string): Promise<string[]> {
    if (!this.redis) {
      return this.getRoomMembers(room).map((m) => m.userId);
    }
    return this.redis.smembers(this.redisUserKey(room));
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
    attachment?: MessageAttachment,
    envelope?: Record<string, unknown>,
  ) {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    const encrypted = !!envelope;
    return this.prisma.roomMessage.create({
      data: {
        roomId,
        senderId,
        body: encrypted ? null : (body ?? ''),
        encrypted,
        algVersion: encrypted ? 1 : null,
        envelope: (envelope as Prisma.InputJsonValue) ?? undefined,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        attachmentName: attachment?.name,
        attachmentEnvelope: attachment?.storageEnvelope as Prisma.InputJsonValue | undefined,
      },
      include: { sender: { select: { name: true, email: true } } },
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
      include: { sender: { select: { name: true, email: true } } },
    });
    return {
      messages: messages.reverse().map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name || m.sender.email || 'Unknown',
        avatar: initials(m.sender.name || m.sender.email || 'Unknown'),
        body: m.body,
        encrypted: m.encrypted,
        algVersion: m.algVersion,
        envelope: m.envelope as Record<string, unknown> | null,
        attachmentUrl: m.attachmentUrl,
        attachmentType: m.attachmentType,
        attachmentName: m.attachmentName,
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore: messages.length === take,
    };
  }
}
