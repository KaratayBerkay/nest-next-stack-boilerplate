import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { UserRole } from '../@generated/prisma/user-role.enum';
import { UserStatus } from '../@generated/prisma/user-status.enum';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { AuditAction } from '../@generated/prisma/audit-action.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TokenStoreService } from '../auth/token-store.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MinTier } from './min-tier.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { TierGuard } from './tier.guard';

/**
 * Demonstrates the RBAC pipeline: `SessionAuthGuard` authenticates and attaches the user, then
 * `RolesGuard` enforces `@Roles()`. `whoAmI` carries no `@Roles()` (any authenticated user is
 * allowed — the "no required roles" path), while `adminStats` is restricted to elevated roles.
 *
 * `setUserTier` lets admins change a user's subscription tier and propagate it to live Redis
 * sessions immediately.
 *
 * `premiumStats` demonstrates the `@MinTier()` gate with `SessionAuthGuard`.
 */
@ObjectType()
export class PremiumStatsPayload {
  @Field(() => Int)
  totalUsers!: number;

  @Field(() => Int)
  activeUsers!: number;

  @Field(() => Float)
  revenue!: number;
}

@ObjectType()
export class GrowthStatsPayload {
  @Field(() => Int)
  totalUsers!: number;

  @Field(() => Int)
  newUsersLast7Days!: number;

  @Field(() => Int)
  totalPosts!: number;

  @Field(() => Int)
  totalFriendships!: number;
}

@UseGuards(SessionAuthGuard, RolesGuard)
@Resolver()
export class AdminResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Query(() => String, { name: 'whoAmI' })
  whoAmI(@CurrentUser() user: JwtUser): string {
    return `${user.email}:${user.role}`;
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Query(() => String, { name: 'adminStats' })
  adminStats(): string {
    return 'top-secret-admin-stats';
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Mutation(() => Boolean)
  async setUserTier(
    @Args('userId') userId: string,
    @Args('tier', { type: () => SubscriptionTier }) tier: SubscriptionTier,
  ): Promise<boolean> {
    // Update Postgres.
    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    });
    // Rewrite live Redis sessions via the reverse index.
    await this.tokenStore.rewriteFieldsForUser(userId, { tier });
    // Push tier change to all live WS connections for this user.
    this.realtime.updateUserTier(userId, tier);
    return true;
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Mutation(() => Boolean)
  async setUserStatus(
    @Args('userId') userId: string,
    @Args('status', { type: () => UserStatus }) status: UserStatus,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<boolean> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // Revoke all active sessions so the user is logged out immediately.
    await this.tokenStore.revokeAllForUser(userId);

    // Close any live WebSocket connections for this user.
    this.realtime.closeAllSocketsForUser(userId);

    // Audit log the action.
    await this.prisma.auditLog.create({
      data: {
        actorId: (await this.prisma.user.findUnique({ where: { id: userId } }))?.id ?? userId,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: userId,
        summary: `User status changed to ${status}${reason ? `: ${reason}` : ''}`,
      },
    });

    return true;
  }

  /** Demo gated resolver: proves tier-based access end-to-end. */
  @UseGuards(SessionAuthGuard, TierGuard)
  @MinTier(SubscriptionTier.BASIC)
  @Query(() => PremiumStatsPayload, { name: 'premiumStats' })
  async premiumStats(): Promise<PremiumStatsPayload> {
    const [totalUsers, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { totalUsers, activeUsers, revenue: totalUsers * 9.99 };
  }

  @UseGuards(SessionAuthGuard, TierGuard)
  @MinTier(SubscriptionTier.MEDIUM)
  @Query(() => GrowthStatsPayload, { name: 'growthStats' })
  async growthStats(): Promise<GrowthStatsPayload> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsersLast7Days, totalPosts, totalFriendships] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({
          where: { createdAt: { gte: sevenDaysAgo } },
        }),
        this.prisma.post.count({ where: { deletedAt: null } }),
        this.prisma.friendship.count({ where: { status: 'ACCEPTED' } }),
      ]);
    return { totalUsers, newUsersLast7Days, totalPosts, totalFriendships };
  }
}
