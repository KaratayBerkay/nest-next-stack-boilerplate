import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { TIER_RANK } from '../authorization/tier-rank';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { NotificationService } from '../notification/notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { StripeService } from './stripe/stripe.service';
import { WalletService } from './wallet.service';
import { OutboxService } from '../outbox/outbox.service';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './payment-provider.interface';
import { Inject } from '@nestjs/common';

const SUBSCRIBER_SELECT = {
  subscriptionTier: true,
  stripeCustomerId: true,
  email: true,
  name: true,
  stripeSubscriptionId: true,
} as const satisfies Prisma.UserSelect;

type SubscriberState = Prisma.UserGetPayload<{
  select: typeof SUBSCRIBER_SELECT;
}>;

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
    private readonly outbox: OutboxService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async subscribeToPlan(
    userId: string,
    targetTier: SubscriptionTier,
    paymentMethodId?: string,
    idempotencyKey?: string,
  ): Promise<{ success: boolean; reason?: string; periodEnd?: Date }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: SUBSCRIBER_SELECT,
    });

    const currentRank = TIER_RANK[user.subscriptionTier];
    const targetRank = TIER_RANK[targetTier];

    if (targetRank === currentRank) {
      throw new BadRequestException('Already on this tier');
    }

    if (targetRank > currentRank) {
      return this.handleUpgrade(
        userId,
        user,
        targetTier,
        paymentMethodId,
        idempotencyKey,
      );
    }

    return this.handleDowngrade(userId, user, targetTier);
  }

  private async handleUpgrade(
    userId: string,
    user: SubscriberState,
    targetTier: SubscriptionTier,
    paymentMethodId: string | undefined,
    idempotencyKey: string | undefined,
  ): Promise<{ success: boolean; reason?: string; periodEnd?: Date }> {
    if (!paymentMethodId) {
      throw new BadRequestException('paymentMethodId required for upgrades');
    }

    const stripeCustomerId = await this.ensureStripeCustomer(userId, user);

    const retryKey =
      idempotencyKey?.trim() || this.generateIdempotencyKey(userId, targetTier);
    const prior = await this.findRetryResult(retryKey);
    if (prior) return prior;

    // A live subscription must never coexist with the replacement
    // (duplicate-charge risk). Cancel the old one first — if Stripe rejects
    // the cancel, abort the upgrade instead of creating a second subscription.
    if (user.stripeSubscriptionId) {
      await this.provider.cancelSubscriptionNow(user.stripeSubscriptionId);
    }

    const chargeResult = await this.provider.createSubscription({
      userId,
      tier: targetTier,
      paymentMethodId,
      stripeCustomerId,
      idempotencyKey: retryKey,
    });

    if (!chargeResult.success) {
      return { success: false, reason: chargeResult.reason };
    }

    // First-invoice row keyed by the invoice so the webhook reconciles into
    // the same row instead of creating a duplicate.
    const rowKey = chargeResult.latestInvoiceId
      ? `stripe_invoice:${chargeResult.latestInvoiceId}`
      : retryKey;

    // Create initial WalletTransaction for the first invoice
    const wallet = await this.wallet.ensureWallet(userId);

    await this.persistUpgrade(
      userId,
      targetTier,
      chargeResult,
      rowKey,
      wallet.id,
    );

    await this.tokenStore.rewriteFieldsForUser(userId, {
      tier: targetTier,
    });
    this.realtime.updateUserTier(userId, targetTier);

    await this.notifyUpgrade(userId, targetTier);

    return {
      success: true,
      periodEnd: chargeResult.periodEnd,
    };
  }

  private async findRetryResult(
    retryKey: string,
  ): Promise<{ success: boolean; reason?: string } | null> {
    const existing = await this.prisma.walletTransaction.findFirst({
      where: { idempotencyKey: retryKey },
    });
    if (!existing) return null;
    const meta = existing.metadata as Record<string, unknown> | null;
    return existing.status === 'COMPLETED'
      ? { success: true }
      : {
          success: false,
          reason:
            typeof meta?.reason === 'string' ? meta.reason : 'declined',
        };
  }

  private async ensureStripeCustomer(
    userId: string,
    user: SubscriberState,
  ): Promise<string> {
    if (user.stripeCustomerId) return user.stripeCustomerId;
    const customer = await this.stripeService.createCustomer(
      user.email,
      user.name ?? undefined,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });
    return customer.id;
  }

  private async notifyUpgrade(
    userId: string,
    targetTier: SubscriptionTier,
  ) {
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
  }

  private async persistUpgrade(
    userId: string,
    targetTier: SubscriptionTier,
    chargeResult: {
      stripeSubscriptionId?: string;
      periodStart?: Date;
      periodEnd?: Date;
      latestInvoiceId?: string;
    },
    rowKey: string,
    walletId: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: targetTier,
          stripeSubscriptionId: chargeResult.stripeSubscriptionId,
          subscriptionPeriodStart: chargeResult.periodStart,
          subscriptionPeriodEnd: chargeResult.periodEnd,
          cancelAtPeriodEnd: false,
        },
      });
      await tx.walletTransaction.create({
        data: {
          type: 'FEE',
          status: 'COMPLETED',
          amount: 0,
          currency: 'USD',
          idempotencyKey: rowKey,
          reference: `subscription:${targetTier}`,
          fromWalletId: walletId,
          stripePaymentIntentId: null,
          metadata: {
            tier: targetTier,
            provider: 'stripe',
            stripeSubscriptionId: chargeResult.stripeSubscriptionId,
            latestInvoiceId: chargeResult.latestInvoiceId,
          },
        },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'billing.tier_upgraded',
          action: 'UPDATE',
          actorId: userId,
          summary: `Subscription upgraded to ${targetTier}`,
          after: { tier: targetTier },
        },
        tx,
      );
    });
  }

  private async handleDowngrade(
    userId: string,
    user: SubscriberState,
    targetTier: SubscriptionTier,
  ): Promise<{ success: boolean; reason?: string; periodEnd?: Date }> {
    const idempotencyKey = this.generateIdempotencyKey(userId, targetTier);
    const wallet = await this.wallet.ensureWallet(userId);

    // Paid -> FREE: keep access through the paid period. The tier stays until
    // the `customer.subscription.deleted` webhook flips it at period end.
    if (targetTier === SubscriptionTier.FREE && user.stripeSubscriptionId) {
      await this.provider.cancelSubscription(user.stripeSubscriptionId);

      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { cancelAtPeriodEnd: true },
        });
        await tx.walletTransaction.create({
          data: {
            type: 'ADJUSTMENT',
            status: 'COMPLETED',
            amount: 0,
            currency: 'USD',
            idempotencyKey,
            reference: `subscription:${user.subscriptionTier}`,
            fromWalletId: wallet.id,
            metadata: {
              tier: user.subscriptionTier,
              provider: 'stripe',
              scheduledCancel: true,
            },
          },
        });
        await this.outbox.emit(
          {
            aggregateType: 'User',
            aggregateId: userId,
            eventType: 'billing.tier_downgraded',
            action: 'UPDATE',
            actorId: userId,
            summary: 'Subscription cancellation scheduled at period end',
            after: { tier: user.subscriptionTier, cancelAtPeriodEnd: true },
          },
          tx,
        );
      });

      await this.sendBillingNotification(
        userId,
        `Subscription cancelled`,
        `Your subscription continues until the end of the current period, then reverts to FREE.`,
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

    // Paid -> paid: switch the price on the existing subscription (prorated)
    // so a replacement is provisioned without a second live subscription.
    if (user.stripeSubscriptionId) {
      const switchResult = await this.provider.switchSubscription({
        stripeSubscriptionId: user.stripeSubscriptionId,
        tier: targetTier,
      });
      if (!switchResult.success) {
        return { success: false, reason: switchResult.reason };
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: targetTier,
            subscriptionPeriodStart: switchResult.periodStart,
            subscriptionPeriodEnd: switchResult.periodEnd,
            cancelAtPeriodEnd: false,
          },
        });
        await tx.walletTransaction.create({
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
              switchedFrom: user.subscriptionTier,
            },
          },
        });
        await this.outbox.emit(
          {
            aggregateType: 'User',
            aggregateId: userId,
            eventType: 'billing.tier_downgraded',
            action: 'UPDATE',
            actorId: userId,
            summary: `Subscription changed to ${targetTier}`,
            after: { tier: targetTier },
          },
          tx,
        );
      });

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

      return { success: true, periodEnd: switchResult.periodEnd };
    }

    // No Stripe subscription on record — fall back to a local tier change.
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: targetTier,
          cancelAtPeriodEnd: true,
        },
      });
      await tx.walletTransaction.create({
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
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'billing.tier_downgraded',
          action: 'UPDATE',
          actorId: userId,
          summary: `Subscription downgraded to ${targetTier}`,
          after: { tier: targetTier },
        },
        tx,
      );
    });

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

  async cancelSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true, subscriptionTier: true },
    });
    if (!user) throw new Error('User not found');
    if (user.subscriptionTier === 'FREE') throw new Error('No active subscription');

    // Fail loudly: a swallowed failure here would leave the user marked
    // pending-cancel while Stripe keeps billing them.
    if (user.stripeSubscriptionId) {
      await this.provider.cancelSubscription(user.stripeSubscriptionId);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: true },
    });

    this.logger.log(
      { category: 'billing', event: 'billing.subscription.canceled', userId },
      `Subscription cancel scheduled for user ${userId}`,
    );
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

  async getPaymentMethods(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return [];
    }

    const methods = await this.stripeService.listPaymentMethods(
      user.stripeCustomerId,
    );

    const customer = await this.stripeService.retrieveCustomer(
      user.stripeCustomerId,
    );
    const defaultPaymentMethodId =
      typeof customer?.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : typeof customer?.invoice_settings?.default_payment_method === 'object'
          ? customer.invoice_settings.default_payment_method?.id
          : null;

    return methods.map((m) => ({
      id: m.id,
      brand: m.card?.brand ?? 'unknown',
      last4: m.card?.last4 ?? '0000',
      expMonth: m.card?.exp_month ?? 0,
      expYear: m.card?.exp_year ?? 0,
      isDefault: m.id === defaultPaymentMethodId,
    }));
  }

  async removePaymentMethod(userId: string, paymentMethodId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer');
    }

    await this.stripeService.detachPaymentMethod(paymentMethodId);
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer');
    }

    await this.stripeService.setDefaultPaymentMethod(
      user.stripeCustomerId,
      paymentMethodId,
    );
  }

  async getBillingAddress(userId: string) {
    return this.prisma.billingAddress.findUnique({
      where: { userId },
    });
  }

  async upsertBillingAddress(
    userId: string,
    data: {
      name?: string;
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
      vatNumber?: string;
    },
  ) {
    return this.prisma.billingAddress.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
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
