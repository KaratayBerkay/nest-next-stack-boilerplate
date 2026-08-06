import { ForbiddenException, Injectable } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { PrismaService } from '../prisma/prisma.service';
import {
  BYTES_PER_LETTER,
  FREE_MONTHLY_STORAGE_BYTES,
  FREE_UPLOAD_STORAGE_BYTES,
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

export interface UploadStorageUsageResult {
  bytes: number;
  fileCount: number;
  limitBytes: number;
  tier: SubscriptionTier;
  multiplier: number;
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

  async assertCanUploadBytes(
    userId: string,
    additionalBytes: number,
    tier: SubscriptionTier,
  ): Promise<void> {
    const usage = await this.getUploadStorageUsage(userId, tier);
    if (usage.bytes + additionalBytes > usage.limitBytes) {
      throw new ForbiddenException({
        exc: 'EX_UPLOAD_STORAGE_LIMIT_REACHED',
        msg: 'Upload storage limit reached',
        key: 'usage.errors.uploadLimitReached',
      });
    }
  }

  /**
   * Total bytes of files this user has uploaded through the chat attachment
   * endpoints (PendingUpload rows are the authoritative set — the store is
   * append-only, every upload persists one row and messages only reference
   * them). Cumulative, unlike the monthly message-storage budget.
   */
  async getUploadStorageUsage(
    userId: string,
    tier: SubscriptionTier,
  ): Promise<UploadStorageUsageResult> {
    const agg = await this.prisma.pendingUpload.aggregate({
      _sum: { size: true },
      _count: { _all: true },
      where: { uploadedBy: userId },
    });
    const multiplier = TIER_STORAGE_MULTIPLIER[tier] ?? 1;

    return {
      bytes: agg._sum.size ?? 0,
      fileCount: agg._count._all,
      limitBytes: FREE_UPLOAD_STORAGE_BYTES * multiplier,
      tier,
      multiplier,
    };
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
