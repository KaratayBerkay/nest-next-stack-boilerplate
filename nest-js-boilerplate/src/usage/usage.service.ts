import { ForbiddenException, Injectable } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { PrismaService } from '../prisma/prisma.service';
import {
  BYTES_PER_LETTER,
  FREE_MONTHLY_STORAGE_BYTES,
  TIER_STORAGE_MULTIPLIER,
} from './usage.constants';

export interface MessageUsageResult {
  letters: number;
  bytes: number;
  limitBytes: number;
  tier: SubscriptionTier;
  multiplier: number;
  from: string;
  to: string;
}

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  private static currentMonthRange(): { from: Date; to: Date } {
    const now = new Date();
    return {
      from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      to: now,
    };
  }

  async assertCanSendMessage(
    userId: string,
    additionalLetters: number,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });
    const tier = (user?.subscriptionTier ?? SubscriptionTier.FREE) as SubscriptionTier;
    const { from, to } = UsageService.currentMonthRange();
    const usage = await this.getMessageUsage(userId, tier, from, to);
    const projectedBytes = Math.round(
      (usage.letters + additionalLetters) * BYTES_PER_LETTER,
    );
    if (projectedBytes > usage.limitBytes) {
      throw new ForbiddenException({
        exc: 'EX_USAGE_LIMIT_REACHED',
        msg: 'Message storage limit reached',
        key: 'usage.errors.limitReached',
      });
    }
  }

  async getMessageUsage(
    userId: string,
    tier: SubscriptionTier,
    from: Date,
    to: Date,
  ): Promise<MessageUsageResult> {
    const where = {
      senderId: userId,
      createdAt: { gte: from, lte: to },
    };
    const [dm, room] = await Promise.all([
      this.prisma.message.aggregate({
        _sum: { letterCount: true },
        where,
      }),
      this.prisma.roomMessage.aggregate({
        _sum: { letterCount: true },
        where,
      }),
    ]);

    const letters = (dm._sum.letterCount ?? 0) + (room._sum.letterCount ?? 0);
    const multiplier = TIER_STORAGE_MULTIPLIER[tier] ?? 1;

    return {
      letters,
      bytes: Math.round(letters * BYTES_PER_LETTER),
      limitBytes: FREE_MONTHLY_STORAGE_BYTES * multiplier,
      tier,
      multiplier,
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }
}
