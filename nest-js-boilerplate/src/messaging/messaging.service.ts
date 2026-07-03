import { Inject } from '@nestjs/common';
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { TokenStoreService } from '../auth/token-store.service';
import { NotificationService } from '../notification/notification.service';

export interface RoomMember {
  socketId: string;
  userId: string;
  name: string;
}

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  private rooms = new Map<string, Map<string, RoomMember>>();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly friends: FriendsService,
    private readonly tokenStore: TokenStoreService,
    private readonly notifications: NotificationService,
  ) {}

  /** Fire-and-forget FRIEND_REQUEST notification — never fails the friend operation. */
  private notifyFriendEvent(
    userId: string,
    actorId: string,
    suffix: string,
    payload?: Record<string, unknown>,
  ) {
    void (async () => {
      const actor = await this.prisma.user.findUnique({
        where: { id: actorId },
        select: { name: true, email: true },
      });
      const who = actor?.name || actor?.email || 'Someone';
      await this.notifications.create({
        userId,
        actorId,
        type: 'FRIEND_REQUEST',
        title: `${who} ${suffix}`,
        payload,
      });
    })().catch((err: Error) =>
      this.logger.warn(`Friend notification failed: ${err.message}`),
    );
  }

  async getUsers(currentUserId: string, search?: string) {
    const existing = await this.prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      select: { requesterId: true, addresseeId: true },
    });

    const excludeIds = new Set<string>([currentUserId]);
    for (const rel of existing) {
      if (rel.requesterId !== currentUserId) excludeIds.add(rel.requesterId);
      if (rel.addresseeId !== currentUserId) excludeIds.add(rel.addresseeId);
    }

    const where: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      id: { notIn: Array.from(excludeIds) },
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });
    return users.map((u) => ({
      ...u,
      avatar: this.initials(u.name || u.email),
    }));
  }

  async getConversations(userId: string): Promise<
    {
      user: { id: string; email: string; name: string | null; avatar: string };
      lastMessage: string;
      lastTime: Date;
      unread: number;
    }[]
  > {
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

    const friendIds = await this.getFriendIds(userId);
    if (friendIds.length === 0) return [];

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
        AND: [
          {
            OR: [
              { senderId: { in: friendIds } },
              { recipientId: { in: friendIds } },
            ],
          },
        ],
      },
      include: { sender: true, recipient: true },
      orderBy: { createdAt: 'desc' },
    });

    const convMap = new Map<
      string,
      {
        user: { id: string; email: string; name: string | null };
        lastMessage: string;
        lastTime: Date;
        unread: number;
      }
    >();

    for (const msg of messages) {
      const otherUserId =
        msg.senderId === userId ? msg.recipientId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.recipient : msg.sender;
      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, {
          user: {
            id: otherUser.id,
            email: otherUser.email,
            name: otherUser.name,
          },
          lastMessage: msg.body,
          lastTime: msg.createdAt,
          unread: 0,
        });
      }
      if (msg.recipientId === userId && !msg.readAt) {
        convMap.get(otherUserId)!.unread += 1;
      }
    }

    const result = Array.from(convMap.values()).map((c) => ({
      user: { ...c.user, avatar: this.initials(c.user.name || c.user.email) },
      lastMessage: c.lastMessage,
      lastTime: c.lastTime,
      unread: c.unread,
    }));
    await this.cache.set(cacheKey, result, 30_000);
    return result;
  }

  async getMessages(
    userId: string,
    otherUserId: string,
    before?: string,
    take = 30,
  ) {
    if (!(await this.areFriends(userId, otherUserId))) {
      return { messages: [], hasMore: false };
    }
    const where: Prisma.MessageWhereInput = {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    };
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }
    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });
    return { messages: messages.reverse(), hasMore: messages.length === take };
  }

  async sendMessage(
    senderId: string,
    recipientId: string,
    text: string,
    friends?: string[],
  ) {
    if (senderId === recipientId) {
      this.logger.warn(`User ${senderId} attempted to message self`);
      throw new ForbiddenException('Cannot send message to yourself');
    }
    const isFriend = friends
      ? friends.includes(recipientId)
      : await this.areFriends(senderId, recipientId);
    if (!isFriend) {
      this.logger.warn(
        `User ${senderId} attempted to message non-friend ${recipientId}`,
      );
      throw new ForbiddenException('You can only send messages to friends');
    }
    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        body: text,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });
    this.logger.log(
      `Message ${message.id} created: ${senderId} → ${recipientId}`,
    );
    await Promise.all([
      this.cache.del(`conversations:${senderId}`),
      this.cache.del(`conversations:${recipientId}`),
    ]);
    return {
      ...message,
      sender: {
        ...message.sender,
        avatar: this.initials(message.sender.name || message.sender.email),
      },
    };
  }

  async saveRoomMessage(roomId: string, senderId: string, body: string) {
    return this.prisma.roomMessage.create({
      data: { roomId, senderId, body },
      include: { sender: { select: { name: true, email: true } } },
    });
  }

  async getRoomMessages(roomId: string, before?: string, take = 30) {
    const where: Prisma.RoomMessageWhereInput = { roomId };
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }
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
        avatar: this.initials(m.sender.name || m.sender.email || 'Unknown'),
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore: messages.length === take,
    };
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

  // --- Friendships ---

  /** Refresh the friends list in Redis for a user. */
  private async refreshFriendIds(userId: string): Promise<void> {
    const ids = await this.friends.getFriendIds(userId);
    this.tokenStore
      .rewriteFieldsForUser(userId, { friends: JSON.stringify(ids) })
      .catch(() => {});
  }

  /** Get IDs of all accepted friends */
  async getFriendIds(userId: string): Promise<string[]> {
    return this.friends.getFriendIds(userId);
  }

  /** Get accepted friend profiles */
  async getFriends(
    userId: string,
    search?: string,
  ): Promise<
    { id: string; email: string; name: string | null; avatar: string }[]
  > {
    const cacheKey = `friends:${userId}:${search || ''}`;
    const cached =
      await this.cache.get<
        { id: string; email: string; name: string | null; avatar: string }[]
      >(cacheKey);
    if (cached) return cached;

    const friendIds = await this.getFriendIds(userId);
    if (friendIds.length === 0) return [];

    const where: Prisma.UserWhereInput = {
      id: { in: friendIds },
      status: 'ACTIVE',
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });
    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: this.initials(u.name || u.email),
    }));
    await this.cache.set(cacheKey, result, 30_000);
    return result;
  }

  /** Get pending friend requests (both sent and received) */
  async getFriendRequests(userId: string) {
    const [incoming, outgoing] = await Promise.all([
      this.prisma.friendship.findMany({
        where: { addresseeId: userId, status: 'PENDING' },
        include: {
          requester: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.friendship.findMany({
        where: { requesterId: userId, status: 'PENDING' },
        include: {
          addressee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const seen = new Set<string>();
    const all = [
      ...incoming.map((r) => ({
        id: r.id,
        direction: 'incoming' as const,
        user: {
          id: r.requester.id,
          name: r.requester.name,
          email: r.requester.email,
          avatar: this.initials(r.requester.name || r.requester.email),
        },
        createdAt: r.createdAt,
      })),
      ...outgoing.map((r) => ({
        id: r.id,
        direction: 'outgoing' as const,
        user: {
          id: r.addressee.id,
          name: r.addressee.name,
          email: r.addressee.email,
          avatar: this.initials(r.addressee.name || r.addressee.email),
        },
        createdAt: r.createdAt,
      })),
    ];

    return all.filter((r) => {
      if (seen.has(r.user.id)) return false;
      seen.add(r.user.id);
      return true;
    });
  }

  /** Send a friend request */
  async sendFriendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new ForbiddenException('Cannot friend yourself');
    }

    // Check both directions to handle mutual requests
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });
    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new ForbiddenException('Already friends');
      }
      if (existing.status === 'PENDING') {
        if (existing.requesterId === requesterId) {
          throw new ForbiddenException('Friend request already sent');
        }
        // Reverse pending request exists — auto-accept both
        await this.prisma.friendship.update({
          where: { id: existing.id },
          data: { status: 'ACCEPTED' },
        });
        // Rewrite friends list in Redis for both users.
        this.refreshFriendIds(requesterId);
        this.refreshFriendIds(addresseeId);
        this.notifyFriendEvent(
          addresseeId,
          requesterId,
          'accepted your friend request',
          { kind: 'friend-accepted' },
        );
        return { success: true };
      }
      if (existing.status === 'BLOCKED') {
        throw new ForbiddenException('Cannot send friend request');
      }
      // If DECLINED, update to PENDING
      await this.prisma.friendship.update({
        where: { id: existing.id },
        data: { status: 'PENDING' },
      });
      this.notifyFriendEvent(
        addresseeId,
        requesterId,
        'sent you a friend request',
        { kind: 'friend-request' },
      );
      return { success: true };
    }

    await this.prisma.friendship.create({
      data: { requesterId, addresseeId, status: 'PENDING' },
    });
    this.notifyFriendEvent(
      addresseeId,
      requesterId,
      'sent you a friend request',
      { kind: 'friend-request' },
    );
    return { success: true };
  }

  /** Accept a friend request */
  async acceptFriendRequest(userId: string, requesterId: string) {
    const req = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: { requesterId, addresseeId: userId },
      },
    });
    if (!req) throw new NotFoundException('Friend request not found');
    if (req.status !== 'PENDING') {
      throw new ForbiddenException('Friend request is not pending');
    }
    await this.prisma.friendship.update({
      where: { id: req.id },
      data: { status: 'ACCEPTED' },
    });
    // Also accept any reverse-direction pending request
    const reverseReq = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: userId,
          addresseeId: requesterId,
        },
      },
    });
    if (reverseReq && reverseReq.status === 'PENDING') {
      await this.prisma.friendship.update({
        where: { id: reverseReq.id },
        data: { status: 'ACCEPTED' },
      });
    }
    // Rewrite friends list in Redis for both users.
    this.refreshFriendIds(requesterId);
    this.refreshFriendIds(userId);
    this.notifyFriendEvent(requesterId, userId, 'accepted your friend request', {
      kind: 'friend-accepted',
    });
    return { success: true };
  }

  /** Decline a friend request */
  async declineFriendRequest(userId: string, requesterId: string) {
    const req = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: { requesterId, addresseeId: userId },
      },
    });
    if (!req) throw new NotFoundException('Friend request not found');
    if (req.status !== 'PENDING') {
      throw new ForbiddenException('Friend request is not pending');
    }
    await this.prisma.friendship.update({
      where: { id: req.id },
      data: { status: 'DECLINED' },
    });
    // Also decline any reverse-direction pending request
    const reverseReq = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: userId,
          addresseeId: requesterId,
        },
      },
    });
    if (reverseReq && reverseReq.status === 'PENDING') {
      await this.prisma.friendship.update({
        where: { id: reverseReq.id },
        data: { status: 'DECLINED' },
      });
    }
    return { success: true };
  }

  /** Check if two users are friends */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    return this.friends.areFriends(userId1, userId2);
  }

  // --- Chat rooms ---

  joinRoom(room: string, member: RoomMember) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Map());
    }
    this.rooms.get(room)!.set(member.socketId, member);
    return this.getRoomMembers(room);
  }

  leaveRoom(room: string, socketId: string) {
    const roomMap = this.rooms.get(room);
    if (roomMap) {
      roomMap.delete(socketId);
      if (roomMap.size === 0) {
        this.rooms.delete(room);
      }
    }
    return this.getRoomMembers(room);
  }

  /** Remove socket from all rooms and return the list of affected rooms. */
  leaveAllRooms(socketId: string): string[] {
    const affected: string[] = [];
    for (const [room, members] of this.rooms) {
      if (members.has(socketId)) {
        members.delete(socketId);
        affected.push(room);
        if (members.size === 0) {
          this.rooms.delete(room);
        }
      }
    }
    return affected;
  }

  getRoomCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [room, members] of this.rooms) {
      counts[room] = members.size;
    }
    return counts;
  }

  getRoomMembers(room: string) {
    const roomMap = this.rooms.get(room);
    if (!roomMap) return [];
    return Array.from(roomMap.values()).map((m) => ({
      id: m.userId,
      name: m.name,
      avatar: this.initials(m.name),
    }));
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name[0] || '?').toUpperCase();
  }
}
