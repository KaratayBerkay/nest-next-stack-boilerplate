import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { TIER_RANK } from '../authorization/tier-rank';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { NotificationService } from '../notification/notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './payment-provider.interface';
import { Inject } from '@nestjs/common';

export interface CardInfo {
  last4: string;
  expMonth: number;
  expYear: number;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly notification: NotificationService,
    private readonly realtime: RealtimeGateway,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async subscribeToPlan(
    userId: string,
    targetTier: SubscriptionTier,
    card?: CardInfo,
  ): Promise<{ success: boolean; reason?: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    const currentRank = TIER_RANK[user.subscriptionTier];
    const targetRank = TIER_RANK[targetTier];

    if (targetRank === currentRank) {
      throw new BadRequestException('Already on this tier');
    }

    const isUpgrade = targetRank > currentRank;

    // Lazily create the user's primary USD wallet on first checkout attempt.
    const wallet = await this.ensureWallet(userId);

    if (isUpgrade) {
      if (!card) {
        throw new BadRequestException('Card information required for upgrades');
      }

      const chargeResult = await this.provider.charge({
        userId,
        tier: targetTier,
        last4: card.last4,
        expMonth: card.expMonth,
        expYear: card.expYear,
      });

      const idempotencyKey = this.generateIdempotencyKey(userId, targetTier);

      if (!chargeResult.approved) {
        await this.prisma.walletTransaction.create({
          data: {
            type: 'FEE',
            status: 'FAILED',
            amount: 0,
            currency: 'USD',
            idempotencyKey,
            reference: `subscription:${targetTier}`,
            fromWalletId: wallet.id,
            metadata: {
              tier: targetTier,
              provider: 'mock',
              last4: card.last4,
              reason: chargeResult.reason,
            },
          },
        });

        return { success: false, reason: chargeResult.reason };
      }

      await this.flipTier(userId, targetTier);

      await this.prisma.walletTransaction.create({
        data: {
          type: 'FEE',
          status: 'COMPLETED',
          amount: 0,
          currency: 'USD',
          idempotencyKey,
          reference: `subscription:${targetTier}`,
          fromWalletId: wallet.id,
          metadata: {
            tier: targetTier,
            provider: 'mock',
            last4: card.last4,
            providerRef: chargeResult.providerRef,
          },
        },
      });

      await this.sendBillingNotification(
        userId,
        `Upgraded to ${targetTier}`,
        `Your subscription has been upgraded to ${targetTier}.`,
      );

      return { success: true };
    }

    // Downgrade — no payment needed
    const idempotencyKey = this.generateIdempotencyKey(userId, targetTier);

    await this.flipTier(userId, targetTier);

    await this.prisma.walletTransaction.create({
      data: {
        type: 'ADJUSTMENT',
        status: 'COMPLETED',
        amount: 0,
        currency: 'USD',
        idempotencyKey,
        reference: `subscription:${targetTier}`,
        fromWalletId: wallet.id,
        metadata: {
          tier: targetTier,
          provider: 'mock',
        },
      },
    });

    await this.sendBillingNotification(
      userId,
      `Downgraded to ${targetTier}`,
      `Your subscription has been changed to ${targetTier}.`,
    );

    return { success: true };
  }

  async getBillingHistory(userId: string) {
    return this.prisma.walletTransaction.findMany({
      where: {
        reference: { startsWith: 'subscription:' },
        OR: [{ fromWallet: { userId } }, { toWallet: { userId } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private async flipTier(userId: string, tier: SubscriptionTier) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    });
    await this.tokenStore.rewriteFieldsForUser(userId, { tier });
    this.realtime.updateUserTier(userId, tier);
  }

  private async ensureWallet(userId: string) {
    const existing = await this.prisma.wallet.findUnique({
      where: { userId_currency: { userId, currency: 'USD' } },
    });
    if (existing) return existing;
    return this.prisma.wallet.create({
      data: { userId, currency: 'USD', isPrimary: true },
    });
  }

  private generateIdempotencyKey(
    userId: string,
    tier: SubscriptionTier,
  ): string {
    const minuteBucket = Math.floor(Date.now() / 60000);
    return `sub:${userId}:${tier}:${minuteBucket}`;
  }

  private async sendBillingNotification(
    userId: string,
    title: string,
    body: string,
  ) {
    await this.notification.create({
      userId,
      actorId: null,
      type: 'BILLING',
      title,
      body,
    });
  }
}
