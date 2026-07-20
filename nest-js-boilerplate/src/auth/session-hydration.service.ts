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
   * Fetches related counts in a single user query + friends query to minimize
   * round-trips.
   */
  async hydrate(user: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    locale: string;
    timezone: string;
  }): Promise<Partial<SessionUserInput>> {
    const [friendIds, userAgg] = await Promise.all([
      this.friends.getFriendIds(user.id),
      this.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          _count: { select: { notifications: { where: { readAt: null } } } },
          memberships: {
            where: { status: 'ACTIVE' },
            select: { organizationId: true },
          },
          teamMemberships: { select: { teamId: true } },
        },
      }),
    ]);

    return {
      name: user.name ?? '',
      username: user.username ?? '',
      avatarUrl: user.avatarUrl ?? '',
      locale: user.locale ?? 'en',
      timezone: user.timezone ?? 'UTC',
      friends: friendIds,
      unread: userAgg?._count.notifications ?? 0,
      orgIds: userAgg?.memberships.map((m) => m.organizationId) ?? [],
      teamIds: userAgg?.teamMemberships.map((tm) => tm.teamId) ?? [],
    };
  }
}
