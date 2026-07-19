import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { TokenStoreService } from '../auth/token-store.service';
import { NotificationService } from '../notification/notification.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { displayName } from '../common/utils/display-name';
import { initials } from './messaging.types';

export class MessagingFriendService {
  private readonly logger = new Logger(MessagingFriendService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheAsideService,
    private readonly friends: FriendsService,
    private readonly tokenStore: TokenStoreService,
    private readonly notifications: NotificationService,
  ) {}

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
      this.logger.error(
        {
          event: 'friend_notification_failed',
          error: err.message,
          userId,
          actorId,
        },
        `Friend notification failed: ${err.message}`,
      ),
    );
  }

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
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });
    return users.map((u) => ({
      ...u,
      name: displayName(u),
      avatar: initials(displayName(u)),
    }));
  }

  async getFriendIds(userId: string): Promise<string[]> {
    return this.friends.getFriendIds(userId);
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    return this.friends.areFriends(userId1, userId2);
  }

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
      avatar: initials(displayName(user ?? { name: null, email: null })),
    };
  }

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
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });
    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: displayName(u),
      avatar: initials(displayName(u)),
    }));
    await this.cache.set(cacheKey, result, 30);
    return result;
  }

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
    return [
      ...incoming.map((r) => ({
        id: r.id,
        direction: 'incoming' as const,
        user: {
          id: r.requester.id,
          name: displayName(r.requester),
          email: r.requester.email,
          avatar: initials(displayName(r.requester)),
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
          avatar: initials(displayName(r.addressee)),
        },
        createdAt: r.createdAt,
      })),
    ].filter((r) => {
      if (seen.has(r.user.id)) return false;
      seen.add(r.user.id);
      return true;
    });
  }

  async sendFriendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId)
      throw new ForbiddenException({
        exc: 'EX_FORBIDDEN',
        msg: 'Cannot friend yourself',
        key: 'friends.errors.cannotFriendYourself',
      });

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });
    if (existing) {
      if (existing.status === 'ACCEPTED')
        throw new ForbiddenException({
          exc: 'EX_CONFLICT_DUPLICATE',
          msg: 'Already friends',
          key: 'friends.errors.alreadyFriends',
        });
      if (existing.status === 'PENDING') {
        if (existing.requesterId === requesterId)
          throw new ForbiddenException({
            exc: 'EX_CONFLICT_DUPLICATE',
            msg: 'Friend request already sent',
            key: 'friends.errors.requestAlreadySent',
          });
        await this.prisma.friendship.update({
          where: { id: existing.id },
          data: { status: 'ACCEPTED' },
        });
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
      if (existing.status === 'BLOCKED')
        throw new ForbiddenException({
          exc: 'EX_FORBIDDEN',
          msg: 'Cannot send friend request',
          key: 'friends.errors.blocked',
        });
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

  async acceptFriendRequest(userId: string, requesterId: string) {
    const req = await this.prisma.friendship.findUnique({
      where: { requesterId_addresseeId: { requesterId, addresseeId: userId } },
    });
    if (!req) throw new NotFoundException('Friend request not found');
    if (req.status !== 'PENDING')
      throw new ForbiddenException('Friend request is not pending');

    await this.prisma.friendship.update({
      where: { id: req.id },
      data: { status: 'ACCEPTED' },
    });
    const reverseReq = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: userId,
          addresseeId: requesterId,
        },
      },
    });
    if (reverseReq && reverseReq.status === 'PENDING')
      await this.prisma.friendship.update({
        where: { id: reverseReq.id },
        data: { status: 'ACCEPTED' },
      });

    this.refreshFriendIds(requesterId);
    this.refreshFriendIds(userId);
    this.cache.del(`friends:${requesterId}:`);
    this.cache.del(`friends:${userId}:`);
    this.cache.del(`conversations:${requesterId}`);
    this.cache.del(`conversations:${userId}`);
    this.notifyFriendEvent(
      requesterId,
      userId,
      'accepted your friend request',
      { kind: 'friend-accepted' },
    );
    return { success: true };
  }

  async declineFriendRequest(userId: string, requesterId: string) {
    const req = await this.prisma.friendship.findUnique({
      where: { requesterId_addresseeId: { requesterId, addresseeId: userId } },
    });
    if (!req) throw new NotFoundException('Friend request not found');
    if (req.status !== 'PENDING')
      throw new ForbiddenException('Friend request is not pending');
    await this.prisma.friendship.update({
      where: { id: req.id },
      data: { status: 'DECLINED' },
    });
    const reverseReq = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: userId,
          addresseeId: requesterId,
        },
      },
    });
    if (reverseReq && reverseReq.status === 'PENDING')
      await this.prisma.friendship.update({
        where: { id: reverseReq.id },
        data: { status: 'DECLINED' },
      });
    return { success: true };
  }
}
