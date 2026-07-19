import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { type RoomMember, initials } from './messaging.types';

export const CHAT_ROOMS = [
  'general',
  'random',
  'tech',
  'design',
  'music',
] as const;
export type ChatRoom = (typeof CHAT_ROOMS)[number];
export const VIP_ROOM_PREFIX = 'vip-';

export function isValidRoom(room: string): boolean {
  return (
    CHAT_ROOMS.includes(room as ChatRoom) || room.startsWith(VIP_ROOM_PREFIX)
  );
}

export class MessagingRoomService {
  private rooms = new Map<string, Map<string, RoomMember>>();

  constructor(private readonly prisma: PrismaService) {}

  joinRoom(room: string, member: RoomMember) {
    if (!this.rooms.has(room)) this.rooms.set(room, new Map());
    this.rooms.get(room)!.set(member.socketId, member);
    return this.getRoomMembers(room);
  }

  leaveRoom(room: string, socketId: string) {
    const roomMap = this.rooms.get(room);
    if (roomMap) {
      roomMap.delete(socketId);
      if (roomMap.size === 0) this.rooms.delete(room);
    }
    return this.getRoomMembers(room);
  }

  leaveAllRooms(socketId: string): string[] {
    const affected: string[] = [];
    for (const [room, members] of this.rooms) {
      if (members.has(socketId)) {
        members.delete(socketId);
        affected.push(room);
        if (members.size === 0) this.rooms.delete(room);
      }
    }
    return affected;
  }

  getRoomCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [room, members] of this.rooms) counts[room] = members.size;
    return counts;
  }

  getRoomMembers(room: string): RoomMember[] {
    const roomMap = this.rooms.get(room);
    return roomMap ? Array.from(roomMap.values()) : [];
  }

  async saveRoomMessage(roomId: string, senderId: string, body: string) {
    if (!isValidRoom(roomId))
      throw new NotFoundException(`Unknown room: ${roomId}`);
    return this.prisma.roomMessage.create({
      data: { roomId, senderId, body },
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
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore: messages.length === take,
    };
  }
}
