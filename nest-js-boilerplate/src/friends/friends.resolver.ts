import { UseGuards } from '@nestjs/common';
import { Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { MinTier } from '../authorization/min-tier.decorator';
import { TierGuard } from '../authorization/tier.guard';
import { FriendsService } from './friends.service';
import { PrismaService } from '../prisma/prisma.service';

@ObjectType()
export class SuggestedFriend {
  @Field()
  id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => Int)
  mutualFriends!: number;
}

@UseGuards(SessionAuthGuard)
@Resolver()
export class FriendsResolver {
  constructor(
    private readonly friends: FriendsService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(TierGuard)
  @MinTier(SubscriptionTier.MEDIUM)
  @Query(() => [SuggestedFriend])
  async suggestedFriends(
    @CurrentUser() user: JwtUser,
  ): Promise<SuggestedFriend[]> {
    const friendIds = await this.friends.getFriendIds(user.userId);
    const excludeIds = new Set([user.userId, ...friendIds]);

    const mutualCounts = await this.friends.getMutualCounts(
      friendIds,
      excludeIds,
    );

    if (mutualCounts.size === 0) return [];

    const topCandidateIds = Array.from(mutualCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    const candidates = await this.prisma.user.findMany({
      where: { id: { in: topCandidateIds } },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    return candidates
      .map((c) => ({
        id: c.id,
        name: c.name ?? undefined,
        email: c.email,
        avatarUrl: c.avatarUrl ?? undefined,
        mutualFriends: mutualCounts.get(c.id) ?? 0,
      }))
      .sort((a, b) => b.mutualFriends - a.mutualFriends);
  }
}
