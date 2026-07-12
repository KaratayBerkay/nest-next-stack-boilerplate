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
import { displayName } from '../common/utils/display-name';

export const CHAT_ROOMS = [
  'general',
  'random',
  'tech',
  'design',
  'music',
] as const;

export type ChatRoom = (typeof CHAT_ROOMS)[number];

// VIP rooms are dynamically named (any `vip-<slug>` string), not pre-registered like
// the fixed CHAT_ROOMS list — the tier gate (see messaging-ws.gateway.ts) is what
// restricts who can join one, not membership in a fixed room list.
export const VIP_ROOM_PREFIX = 'vip-';

export function isValidRoom(room: string): boolean {
  return (
    CHAT_ROOMS.includes(room as ChatRoom) || room.startsWith(VIP_ROOM_PREFIX)
  );
}

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
      const who = displayName(actor ?? { name: null, email: 'Someone' });
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
        status: { in: ['PENDING', 'ACCEPTED', 'BLOCKED'] },
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
      name: displayName(u),
      avatar: this.initials(displayName(u)),
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

    const unreads = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: { recipientId: userId, readAt: null, senderId: { in: friendIds } },
      _count: { id: true },
    });
    const unreadMap = new Map<string, number>(
      unreads.map((u) => [u.senderId, u._count.id]),
    );

    const sentMessages = await this.prisma.$queryRawUnsafe<
      Array<{ id: string; body: string; recipientId: string; createdAt: Date }>
    >(
      `SELECT DISTINCT ON ("recipientId") id, body, "recipientId", "createdAt"
       FROM "Message"
       WHERE "senderId" = $1::uuid AND "recipientId" = ANY($2::uuid[])
       ORDER BY "recipientId", "createdAt" DESC`,
      userId,
      friendIds,
    );

    const receivedMessages = await this.prisma.$queryRawUnsafe<
      Array<{ id: string; body: string; senderId: string; createdAt: Date }>
    >(
      `SELECT DISTINCT ON ("senderId") id, body, "senderId", "createdAt"
       FROM "Message"
       WHERE "recipientId" = $1::uuid AND "senderId" = ANY($2::uuid[])
       ORDER BY "senderId", "createdAt" DESC`,
      userId,
      friendIds,
    );

    const latestPerPeer = new Map<
      string,
      { lastMessage: string; lastTime: Date }
    >();
    for (const msg of sentMessages) {
      latestPerPeer.set(msg.recipientId, {
        lastMessage: msg.body,
        lastTime: msg.createdAt,
      });
    }
    for (const msg of receivedMessages) {
      const existing = latestPerPeer.get(msg.senderId);
      if (!existing || msg.createdAt > existing.lastTime) {
        latestPerPeer.set(msg.senderId, {
          lastMessage: msg.body,
          lastTime: msg.createdAt,
        });
      }
    }

    const peerIds = Array.from(latestPerPeer.keys());
    const peerUsers = await this.prisma.user.findMany({
      where: { id: { in: peerIds } },
      select: { id: true, email: true, name: true },
    });
    const userMap = new Map(peerUsers.map((u) => [u.id, u]));

    const result = peerIds
      .map((peerId) => {
        const latest = latestPerPeer.get(peerId)!;
        const user = userMap.get(peerId) ?? {
          id: peerId,
          email: 'unknown',
          name: null as string | null,
        };
        return {
          user: {
            ...user,
            name: displayName(user),
            avatar: this.initials(displayName(user)),
          },
          lastMessage: latest.lastMessage,
          lastTime: latest.lastTime,
          unread: unreadMap.get(peerId) ?? 0,
        };
      })
      .sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());

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

  async saveRoomMessage(roomId: string, senderId: string, body: string) {
    if (!isValidRoom(roomId)) {
      throw new NotFoundException(`Unknown room: ${roomId}`);
    }
    return this.prisma.roomMessage.create({
      data: { roomId, senderId, body },
      include: { sender: { select: { name: true, email: true } } },
    });
  }

  async getRoomMessages(roomId: string, before?: string, take = 30) {
    if (!isValidRoom(roomId)) {
      throw new NotFoundException(`Unknown room: ${roomId}`);
    }
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
      .catch((err: Error) =>
        this.logger.warn(
          `Failed to refresh friend IDs for ${userId}: ${err.message}`,
        ),
      );
  }

  /** Get IDs of all accepted friends */
  async getFriendIds(userId: string): Promise<string[]> {
    return this.friends.getFriendIds(userId);
  }

  /** Lookup user display data for realtime conversation pushes. */
  async getUserDisplay(
    userId: string,
  ): Promise<{ id: string; email: string; name: string; avatar: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    return {
      id: userId,
      email: user?.email ?? 'unknown',
      name: displayName(user ?? { name: null, email: null }),
      avatar: this.initials(displayName(user ?? { name: null, email: null })),
    };
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
      name: displayName(u),
      avatar: this.initials(displayName(u)),
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
          name: displayName(r.requester),
          email: r.requester.email,
          avatar: this.initials(displayName(r.requester)),
        },
        createdAt: r.createdAt,
      })),
      ...outgoing.map((r) => ({
        id: r.id,
        direction: 'outgoing' as const,
        user: {
          id: r.addressee.id,
          name: displayName(r.addressee),
          email: r.addressee.email,
          avatar: this.initials(displayName(r.addressee)),
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
      throw new ForbiddenException({
        exc: 'EX_FORBIDDEN',
        msg: 'Cannot friend yourself',
        key: 'friends.errors.cannotFriendYourself',
      });
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
        throw new ForbiddenException({
          exc: 'EX_CONFLICT_DUPLICATE',
          msg: 'Already friends',
          key: 'friends.errors.alreadyFriends',
        });
      }
      if (existing.status === 'PENDING') {
        if (existing.requesterId === requesterId) {
          throw new ForbiddenException({
            exc: 'EX_CONFLICT_DUPLICATE',
            msg: 'Friend request already sent',
            key: 'friends.errors.requestAlreadySent',
          });
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
        throw new ForbiddenException({
          exc: 'EX_FORBIDDEN',
          msg: 'Cannot send friend request',
          key: 'friends.errors.blocked',
        });
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
    // Invalidate cached friend profiles and conversation lists for both users.
    this.cache.del(`friends:${requesterId}:`);
    this.cache.del(`friends:${userId}:`);
    this.cache.del(`conversations:${requesterId}`);
    this.cache.del(`conversations:${userId}`);
    this.notifyFriendEvent(
      requesterId,
      userId,
      'accepted your friend request',
      {
        kind: 'friend-accepted',
      },
    );
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

  getRoomMembers(room: string): RoomMember[] {
    const roomMap = this.rooms.get(room);
    if (!roomMap) return [];
    return Array.from(roomMap.values());
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name[0] || '?').toUpperCase();
  }
}
