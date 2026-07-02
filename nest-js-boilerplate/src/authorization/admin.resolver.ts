import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '../@generated/prisma/user-role.enum';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TokenStoreService } from '../auth/token-store.service';
import { PrismaService } from '../prisma/prisma.service';
import { MinTier } from './min-tier.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { TierGuard } from './tier.guard';

/**
 * Demonstrates the RBAC pipeline: `JwtAuthGuard` authenticates and attaches the user, then
 * `RolesGuard` enforces `@Roles()`. `whoAmI` carries no `@Roles()` (any authenticated user is
 * allowed — the "no required roles" path), while `adminStats` is restricted to elevated roles.
 *
 * `setUserTier` lets admins change a user's subscription tier and propagate it to live Redis
 * sessions immediately.
 *
 * `premiumStats` demonstrates the `@MinTier()` gate with `SessionAuthGuard`.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class AdminResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
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
    await this.tokenStore.rewriteTierForUser(userId, tier);
    return true;
  }

  /** Demo gated resolver: proves tier-based access end-to-end. */
  @UseGuards(SessionAuthGuard, TierGuard)
  @MinTier(SubscriptionTier.BASIC)
  @Query(() => String, { name: 'premiumStats' })
  premiumStats(@CurrentUser() user: JwtUser): string {
    return `Premium stats for ${user.email} (tier: ${user.tier})`;
  }
}
