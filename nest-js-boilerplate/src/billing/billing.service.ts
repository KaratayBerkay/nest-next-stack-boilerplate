import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { TIER_RANK } from '../authorization/tier-rank';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { NotificationService } from '../notification/notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { StripeService } from './stripe/stripe.service';
import { WalletService } from './wallet.service';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './payment-provider.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly notification: NotificationService,
    private readonly realtime: RealtimeGateway,
    private readonly stripeService: StripeService,
    private readonly wallet: WalletService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async subscribeToPlan(
    userId: string,
    targetTier: SubscriptionTier,
    paymentMethodId?: string,
  ): Promise<{ success: boolean; reason?: string; periodEnd?: Date }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        stripeCustomerId: true,
        email: true,
        name: true,
      },
    });

    const currentRank = TIER_RANK[user.subscriptionTier];
    const targetRank = TIER_RANK[targetTier];

    if (targetRank === currentRank) {
      throw new BadRequestException('Already on this tier');
    }

    const isUpgrade = targetRank > currentRank;

    if (isUpgrade) {
      if (!paymentMethodId) {
        throw new BadRequestException('paymentMethodId required for upgrades');
      }

      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await this.stripeService.createCustomer(
          user.email,
          user.name ?? undefined,
        );
        stripeCustomerId = customer.id;
        await this.prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });
      }

      const idempotencyKey = this.generateIdempotencyKey(userId, targetTier);
      const existing = await this.prisma.walletTransaction.findFirst({
        where: { idempotencyKey },
      });
      if (existing) {
        const meta = existing.metadata as Record<string, unknown> | null;
        return existing.status === 'COMPLETED'
          ? { success: true }
          : {
              success: false,
              reason:
                typeof meta?.reason === 'string' ? meta.reason : 'declined',
            };
      }

      const chargeResult = await this.provider.createSubscription({
        userId,
        tier: targetTier,
        paymentMethodId,
        stripeCustomerId,
      });

      if (!chargeResult.success) {
        return { success: false, reason: chargeResult.reason };
      }

      // Create initial WalletTransaction for the first invoice
      const wallet = await this.wallet.ensureWallet(userId);

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: targetTier,
            stripeSubscriptionId: chargeResult.stripeSubscriptionId,
            subscriptionPeriodStart: chargeResult.periodStart,
            subscriptionPeriodEnd: chargeResult.periodEnd,
          },
        }),
        this.prisma.walletTransaction.create({
          data: {
            type: 'FEE',
            status: 'COMPLETED',
            amount: 0,
            currency: 'USD',
            idempotencyKey,
            reference: `subscription:${targetTier}`,
            fromWalletId: wallet.id,
            stripePaymentIntentId: null,
            metadata: {
              tier: targetTier,
              provider: 'stripe',
              stripeSubscriptionId: chargeResult.stripeSubscriptionId,
              latestInvoiceId: chargeResult.latestInvoiceId,
            },
          },
        }),
      ]);

      await this.tokenStore.rewriteFieldsForUser(userId, {
        tier: targetTier,
      });
      this.realtime.updateUserTier(userId, targetTier);

      await this.sendBillingNotification(
        userId,
        `Upgraded to ${targetTier}`,
        `Your subscription has been upgraded to ${targetTier}.`,
      ).catch((err: Error) =>
        this.logger.warn(
          {
            category: 'billing',
            event: 'billing.notification_failed',
            error: err.message,
          },
          `Billing notification failed: ${err.message}`,
        ),
      );

      return {
        success: true,
        periodEnd: chargeResult.periodEnd,
      };
    }

    // Downgrade
    const idempotencyKey = this.generateIdempotencyKey(userId, targetTier);
    const wallet = await this.wallet.ensureWallet(userId);

    // Cancel Stripe subscription at period end
    if (user.stripeCustomerId) {
      const sub = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { stripeSubscriptionId: true },
      });
      if (sub?.stripeSubscriptionId) {
        await this.provider
          .cancelSubscription(sub.stripeSubscriptionId)
          .catch((err: Error) =>
            this.logger.warn(
              {
                category: 'billing',
                event: 'billing.cancel_failed',
                error: err.message,
              },
              `Failed to cancel Stripe subscription: ${err.message}`,
            ),
          );
      }
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: targetTier,
          cancelAtPeriodEnd: true,
        },
      }),
      this.prisma.walletTransaction.create({
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
            provider: 'stripe',
          },
        },
      }),
    ]);

    await this.tokenStore.rewriteFieldsForUser(userId, { tier: targetTier });
    this.realtime.updateUserTier(userId, targetTier);

    await this.sendBillingNotification(
      userId,
      `Downgraded to ${targetTier}`,
      `Your subscription has been changed to ${targetTier}.`,
    ).catch((err: Error) =>
      this.logger.warn(
        {
          category: 'billing',
          event: 'billing.notification_failed',
          error: err.message,
        },
        `Billing notification failed: ${err.message}`,
      ),
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

  async getSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionPeriodStart: true,
        subscriptionPeriodEnd: true,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: true,
      },
    });
    if (!user) return null;

    const priceCents = Number(
      process.env[`PRICE_${user.subscriptionTier}`] ??
        {
          FREE: '0',
          BASIC: '999',
          MEDIUM: '1999',
          PREMIUM: '4999',
        }[user.subscriptionTier] ??
        0,
    );

    return {
      tier: user.subscriptionTier as SubscriptionTier,
      priceCents,
      currency: 'USD',
      periodStart: user.subscriptionPeriodStart,
      periodEnd: user.subscriptionPeriodEnd,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    };
  }

  async createSetupIntent(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        user.email,
        user.name ?? undefined,
      );
      stripeCustomerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const setupIntent =
      await this.stripeService.createSetupIntent(stripeCustomerId);
    return { clientSecret: setupIntent.client_secret };
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
