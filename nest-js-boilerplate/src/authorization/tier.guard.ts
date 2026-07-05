import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import type { JwtUser } from '../auth/auth.types';
import { MIN_TIER_KEY } from './min-tier.decorator';
import { TIER_RANK } from './tier-rank';

/**
 * Tier-based access guard. Reads the required minimum tier from `@MinTier()` on the handler
 * and compares it against `req.user.tier` (set by `SessionAuthGuard`).
 *
 * Run it AFTER `SessionAuthGuard`, e.g. `@UseGuards(SessionAuthGuard, TierGuard)`.
 */
@Injectable()
export class TierGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<SubscriptionTier>(
      MIN_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredTier) {
      return true;
    }

    const { user } = this.getRequest(context);
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userTier = user.tier as SubscriptionTier;
    const userRank = TIER_RANK[userTier] ?? -1;
    const requiredRank = TIER_RANK[requiredTier] ?? Infinity;

    if (userRank < requiredRank) {
      throw new ForbiddenException(
        `Requires ${requiredTier} subscription or higher`,
      );
    }

    return true;
  }

  private getRequest(context: ExecutionContext): { user?: JwtUser } {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext<{
        req: { user?: JwtUser };
      }>().req;
    }
    return context.switchToHttp().getRequest<Request & { user?: JwtUser }>();
  }
}
