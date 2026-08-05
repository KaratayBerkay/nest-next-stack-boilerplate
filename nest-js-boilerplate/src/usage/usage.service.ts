import { Injectable } from '@nestjs/common';
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
