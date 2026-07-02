import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import type { SessionUserInput } from './auth.types';

@Injectable()
export class SessionHydrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friends: FriendsService,
  ) {}

  /**
   * Gather runtime snapshot data for a user at token-issue time (cold path).
   * These fields serve the zero-PG hot path from the Redis value.
   */
  async hydrate(user: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    locale: string;
    timezone: string;
  }): Promise<Partial<SessionUserInput>> {
    const [friendIds, unreadCount, memberships, teamMemberships] =
      await Promise.all([
        this.friends.getFriendIds(user.id),
        this.prisma.notification.count({
          where: { userId: user.id, readAt: null },
        }),
        this.prisma.membership.findMany({
          where: { userId: user.id, status: 'ACTIVE' },
          select: { organizationId: true },
        }),
        this.prisma.teamMember.findMany({
          where: { userId: user.id },
          select: { teamId: true },
        }),
      ]);

    return {
      name: user.name ?? '',
      username: user.username ?? '',
      avatarUrl: user.avatarUrl ?? '',
      locale: user.locale ?? 'en',
      timezone: user.timezone ?? 'UTC',
      friends: friendIds,
      unread: unreadCount,
      orgIds: memberships.map((m) => m.organizationId),
      teamIds: teamMemberships.map((tm) => tm.teamId),
    };
  }
}
