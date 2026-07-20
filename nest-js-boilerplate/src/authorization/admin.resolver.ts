import { UseGuards, Logger } from '@nestjs/common';
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
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MfaService } from '../mfa/mfa.service';
import { OutboxService } from '../outbox/outbox.service';
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
  private readonly logger = new Logger(AdminResolver.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly realtime: RealtimeGateway,
    private readonly mfa: MfaService,
    private readonly outbox: OutboxService,
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

  private async createAuditLog(data: Prisma.AuditLogUncheckedCreateInput) {
    try {
      return await this.prisma.auditLog.create({ data });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003' &&
        data.actorId
      ) {
        this.logger.warn(
          `actorId ${JSON.stringify(data.actorId)} no longer exists — retrying with null`,
        );
        return await this.prisma.auditLog.create({
          data: { ...data, actorId: null },
        });
      }
      throw err;
    }
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

    const prev = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { subscriptionTier: tier },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'admin.tier_changed',
          action: 'UPDATE',
          actorId: admin.userId,
          summary: `User tier changed to ${tier}`,
          before: { tier: prev?.subscriptionTier },
          after: { tier },
        },
        tx,
      );
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

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'admin.status_changed',
          action: 'UPDATE',
          actorId: admin.userId,
          summary: `User status changed to ${status}${reason ? `: ${reason}` : ''}`,
        },
        tx,
      );
    });
    await this.tokenStore.revokeAllForUser(userId);
    this.realtime.closeAllSocketsForUser(userId);
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
    await this.prisma.$transaction(async (tx) => {
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'admin.mfa_reset',
          action: 'UPDATE',
          actorId: admin.userId,
          summary: 'MFA reset by administrator',
        },
        tx,
      );
    });
    return true;
  }
}
