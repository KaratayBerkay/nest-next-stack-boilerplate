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
import { MfaService } from '../mfa/mfa.service';
import { MinTier } from './min-tier.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { TierGuard } from './tier.guard';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.MODERATOR]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPERADMIN]: 3,
};

function isTargetRoleGteActor(targetRole: string, actorRole: string): boolean {
  const actorLevel = ROLE_HIERARCHY[actorRole as UserRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY[targetRole as UserRole] ?? 0;
  return targetLevel >= actorLevel;
}

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
    private readonly mfa: MfaService,
  ) {}

  /** Look up the target user and reject if missing or role >= actor. Returns target role or null. */
  private async findTargetOrReject(
    userId: string,
    actorRole: string,
  ): Promise<string | null> {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!target || isTargetRoleGteActor(target.role, actorRole)) return null;
    return target.role;
  }

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
    @CurrentUser() admin: JwtUser,
    @Args('userId') userId: string,
    @Args('tier', { type: () => SubscriptionTier }) tier: SubscriptionTier,
  ): Promise<boolean> {
    if (!(await this.findTargetOrReject(userId, admin.role))) return false;

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    });
    await this.tokenStore.rewriteFieldsForUser(userId, { tier });
    this.realtime.updateUserTier(userId, tier);
    return true;
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Mutation(() => Boolean)
  async setUserStatus(
    @CurrentUser() admin: JwtUser,
    @Args('userId') userId: string,
    @Args('status', { type: () => UserStatus }) status: UserStatus,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<boolean> {
    if (!(await this.findTargetOrReject(userId, admin.role))) return false;

    await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    await this.tokenStore.revokeAllForUser(userId);
    this.realtime.closeAllSocketsForUser(userId);
    await this.prisma.auditLog.create({
      data: {
        actorId: admin.userId,
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

  @Roles(UserRole.SUPERADMIN)
  @Mutation(() => Boolean)
  async resetMfa(
    @CurrentUser() admin: JwtUser,
    @Args('userId') userId: string,
  ): Promise<boolean> {
    if (!(await this.findTargetOrReject(userId, admin.role))) return false;

    const changed = await this.mfa.resetMfa(userId);
    if (!changed) return false;

    await this.tokenStore.revokeAllForUser(userId);
    await this.prisma.auditLog.create({
      data: {
        actorId: admin.userId,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: userId,
        summary: 'MFA reset by administrator',
      },
    });
    return true;
  }
}
