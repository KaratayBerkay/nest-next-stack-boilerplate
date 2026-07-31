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
  subscriptionPeriodEnd: true,
  pendingTier: true,
  pendingTierEffectiveAt: true,
  stripeSubscriptionScheduleId: true,
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

    // Establishing a brand-new live subscription — there's no current paid
    // period to defer against, so this charges immediately as before.
    if ((user.subscriptionTier as SubscriptionTier) === SubscriptionTier.FREE) {
      return this.handleFirstSubscribe(
        userId,
        targetTier,
        paymentMethodId,
        idempotencyKey,
      );
    }

    // Full cancellation: keep access through the current paid period, as
    // before — the tier flips to FREE when Stripe's subscription.deleted
    // webhook lands at period end.
    if (targetTier === SubscriptionTier.FREE) {
      return this.handleFullCancellation(userId, user);
    }

    // Paid <-> paid, either direction: defer the price change to the next
    // renewal instead of charging or crediting mid-cycle. The user keeps
    // `subscriptionTier` (and its features/access) until the boundary.
    return this.handleTierChange(userId, user, targetTier);
  }

  private async handleFirstSubscribe(
    userId: string,
    targetTier: SubscriptionTier,
    paymentMethodId: string | undefined,
    idempotencyKey: string | undefined,
  ): Promise<{ success: boolean; reason?: string; periodEnd?: Date }> {
    if (!paymentMethodId) {
      throw new BadRequestException('paymentMethodId required for upgrades');
    }

    // Serialize concurrent subscribe/upgrade attempts per user with a Postgres
    // advisory lock: a double-click or two-tab first-time subscribe must never
    // create two live Stripe subscriptions, regardless of whether
    // stripeSubscriptionId is set yet. Held until the transaction commits.
    let provisioned = false;
    let result: { success: boolean; reason?: string; periodEnd?: Date } | null =
      null;

    await this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

        // Re-read inside the lock: the pre-lock snapshot may be stale if a
        // concurrent request already completed this upgrade.
        const lockedUser = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: SUBSCRIBER_SELECT,
        });
        if (
          TIER_RANK[lockedUser.subscriptionTier] >= TIER_RANK[targetTier]
        ) {
          // Already provisioned (or higher) by a concurrent request — never
          // cancel its live subscription or create a duplicate.
          result = {
            success: true,
            periodEnd: lockedUser.subscriptionPeriodEnd ?? undefined,
          };
          return;
        }

        const retryKey =
          idempotencyKey?.trim() ||
          this.generateIdempotencyKey(userId, targetTier);
        const prior = await this.findRetryResult(tx, retryKey);
        if (prior) {
          result = prior;
          return;
        }

        const stripeCustomerId = await this.ensureStripeCustomer(
          tx,
          userId,
          lockedUser,
        );

        // A live subscription must never coexist with the replacement
        // (duplicate-charge risk). Cancel the old one first — if Stripe
        // rejects the cancel, abort the upgrade instead of creating a second
        // subscription.
        if (lockedUser.stripeSubscriptionId) {
          await this.provider.cancelSubscriptionNow(
            lockedUser.stripeSubscriptionId,
          );
        }

        const chargeResult = await this.provider.createSubscription({
          userId,
          tier: targetTier,
          paymentMethodId,
          stripeCustomerId,
          idempotencyKey: retryKey,
        });

        if (!chargeResult.success) {
          result = { success: false, reason: chargeResult.reason };
          return;
        }

        // First-invoice row keyed by the invoice so the webhook reconciles
        // into the same row instead of creating a duplicate.
        const rowKey = chargeResult.latestInvoiceId
          ? `stripe_invoice:${chargeResult.latestInvoiceId}`
          : retryKey;

        const wallet = await this.wallet.ensureWallet(userId);

        provisioned = await this.persistUpgrade(
          tx,
          userId,
          targetTier,
          chargeResult,
          rowKey,
          retryKey,
          wallet.id,
        );

        result = { success: true, periodEnd: chargeResult.periodEnd };
      },
      { maxWait: 15_000, timeout: 120_000 },
    );

    if (provisioned) {
      await this.tokenStore.rewriteFieldsForUser(userId, {
        tier: targetTier,
      });
      this.realtime.updateUserTier(userId, targetTier);
      await this.notifyUpgrade(userId, targetTier);
    }

    return result ?? { success: false, reason: 'subscription_failed' };
  }

  private async findRetryResult(
    tx: Prisma.TransactionClient,
    retryKey: string,
  ): Promise<{ success: boolean; reason?: string } | null> {
    const existing = await tx.walletTransaction.findFirst({
      where: { clientIdempotencyKey: retryKey },
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
    tx: Prisma.TransactionClient,
    userId: string,
    user: SubscriberState,
  ): Promise<string> {
    if (user.stripeCustomerId) return user.stripeCustomerId;
    const customer = await this.stripeService.createCustomer(
      user.email,
      user.name ?? undefined,
    );
    await tx.user.update({
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
    tx: Prisma.TransactionClient,
    userId: string,
    targetTier: SubscriptionTier,
    chargeResult: {
      stripeSubscriptionId?: string;
      periodStart?: Date;
      periodEnd?: Date;
      latestInvoiceId?: string;
    },
    rowKey: string,
    clientKey: string,
    walletId: string,
  ): Promise<boolean> {
    // Defense in depth: a live subscription provisioned by a concurrent
    // request must never be overwritten — cancel the just-created one so the
    // customer is never billed twice. (Unreachable under the advisory lock,
    // kept as a hard guarantee regardless of future refactors.)
    const existingSub = await tx.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });
    if (
      existingSub?.stripeSubscriptionId &&
      existingSub.stripeSubscriptionId !== chargeResult.stripeSubscriptionId
    ) {
      if (chargeResult.stripeSubscriptionId) {
        await this.provider.cancelSubscriptionNow(
          chargeResult.stripeSubscriptionId,
        );
      }
      return false;
    }

    const data = {
      type: 'FEE',
      status: 'COMPLETED',
      amount: 0,
      currency: 'USD',
      reference: `subscription:${targetTier}`,
      stripePaymentIntentId: null,
      fromWalletId: walletId,
      metadata: {
        tier: targetTier,
        provider: 'stripe',
        stripeSubscriptionId: chargeResult.stripeSubscriptionId,
        latestInvoiceId: chargeResult.latestInvoiceId,
      },
    } as const;

    // The async invoice.paid webhook may have won the race and already
    // written the invoice-keyed row — reconcile into it instead of colliding
    // on the unique constraint (which would roll back the whole transaction,
    // including the tier upgrade, for a customer who was genuinely charged).
    const existing = await tx.walletTransaction.findUnique({
      where: { idempotencyKey: rowKey },
    });

    if (existing) {
      await tx.walletTransaction.update({
        where: { idempotencyKey: rowKey },
        data: {
          clientIdempotencyKey: existing.clientIdempotencyKey ?? clientKey,
          reference: data.reference,
          metadata: {
            ...(existing.metadata as Record<string, unknown> | null),
            ...data.metadata,
          },
        },
      });
    } else {
      await tx.walletTransaction.create({
        data: {
          ...data,
          idempotencyKey: rowKey,
          clientIdempotencyKey: clientKey,
        },
      });
    }

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
    return true;
  }

  private async handleFullCancellation(
    userId: string,
    user: SubscriberState,
  ): Promise<{ success: boolean; reason?: string; periodEnd?: Date }> {
    // Paid -> FREE: keep access through the paid period. The tier stays until
    // the `customer.subscription.deleted` webhook flips it at period end.
    if (user.stripeSubscriptionId) {
      const idempotencyKey = this.generateIdempotencyKey(
        userId,
        SubscriptionTier.FREE,
      );
      const wallet = await this.wallet.ensureWallet(userId);

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

    // No Stripe subscription on record — fall back to a local tier change.
    return this.applyLocalTierChange(userId, SubscriptionTier.FREE);
  }

  /**
   * Paid <-> paid, either direction. Never charges or credits now: schedules
   * the price change on the existing Stripe subscription for the next
   * renewal (see `StripeService.scheduleSubscriptionChange`), so the user
   * keeps `subscriptionTier`'s access/features until the boundary. The
   * `pendingTier` set here is only cleared once the next `invoice.paid`
   * webhook actually reconciles the tier — see
   * `StripeWebhookController.handleInvoicePaid`.
   */
  private async handleTierChange(
    userId: string,
    user: SubscriberState,
    targetTier: SubscriptionTier,
  ): Promise<{ success: boolean; reason?: string; periodEnd?: Date }> {
    if (!user.stripeSubscriptionId) {
      return this.applyLocalTierChange(userId, targetTier);
    }

    // Serialize concurrent tier-change requests per user — a double-click
    // must never create two competing subscription schedules.
    let scheduled = false;
    let result: { success: boolean; reason?: string; periodEnd?: Date } | null =
      null;

    await this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

        const lockedUser = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: SUBSCRIBER_SELECT,
        });

        if ((lockedUser.subscriptionTier as SubscriptionTier) === targetTier) {
          // A previous schedule already reconciled onto this tier.
          result = {
            success: true,
            periodEnd: lockedUser.subscriptionPeriodEnd ?? undefined,
          };
          return;
        }
        if (lockedUser.pendingTier === targetTier) {
          // Already scheduled by a concurrent request.
          result = {
            success: true,
            periodEnd: lockedUser.pendingTierEffectiveAt ?? undefined,
          };
          return;
        }

        const scheduleResult = await this.provider.scheduleTierChange({
          stripeSubscriptionId: lockedUser.stripeSubscriptionId!,
          stripeSubscriptionScheduleId: lockedUser.stripeSubscriptionScheduleId,
          tier: targetTier,
        });
        if (!scheduleResult.success) {
          result = { success: false, reason: scheduleResult.reason };
          return;
        }

        const wallet = await this.wallet.ensureWallet(userId);
        const idempotencyKey = this.generateIdempotencyKey(userId, targetTier);

        await tx.user.update({
          where: { id: userId },
          data: {
            pendingTier: targetTier,
            pendingTierEffectiveAt: scheduleResult.effectiveAt,
            stripeSubscriptionScheduleId:
              scheduleResult.stripeSubscriptionScheduleId,
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
              scheduledChange: true,
              switchedFrom: lockedUser.subscriptionTier,
              effectiveAt: scheduleResult.effectiveAt,
            },
          },
        });
        await this.outbox.emit(
          {
            aggregateType: 'User',
            aggregateId: userId,
            eventType: 'billing.tier_change_scheduled',
            action: 'UPDATE',
            actorId: userId,
            summary: `Subscription change to ${targetTier} scheduled for ${scheduleResult.effectiveAt?.toISOString() ?? 'next renewal'}`,
            after: {
              tier: lockedUser.subscriptionTier,
              pendingTier: targetTier,
            },
          },
          tx,
        );

        scheduled = true;
        result = { success: true, periodEnd: scheduleResult.effectiveAt };
      },
      { maxWait: 15_000, timeout: 120_000 },
    );

    if (scheduled) {
      await this.sendBillingNotification(
        userId,
        `Plan change scheduled`,
        `Your plan will change to ${targetTier} at the start of your next billing period.`,
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

    return result ?? { success: false, reason: 'schedule_failed' };
  }

  /**
   * No real Stripe subscription behind the current tier (e.g. set via an
   * admin/dev shortcut) — nothing to schedule against, so apply the tier
   * change locally and immediately.
   */
  private async applyLocalTierChange(
    userId: string,
    targetTier: SubscriptionTier,
  ): Promise<{ success: boolean; periodEnd?: Date }> {
    const idempotencyKey = this.generateIdempotencyKey(userId, targetTier);
    const wallet = await this.wallet.ensureWallet(userId);

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
          eventType: 'billing.tier_changed',
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
      `Plan changed to ${targetTier}`,
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
        pendingTier: true,
        pendingTierEffectiveAt: true,
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
      pendingTier: user.pendingTier as SubscriptionTier | null,
      pendingTierEffectiveAt: user.pendingTierEffectiveAt,
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
