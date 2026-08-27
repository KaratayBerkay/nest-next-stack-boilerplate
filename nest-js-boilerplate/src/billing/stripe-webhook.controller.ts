import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { StripeService } from './stripe/stripe.service';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { OutboxService } from '../outbox/outbox.service';

const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024; // 1 MB

@Controller('stripe')
@SkipThrottle()
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly wallet: WalletService,
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly notification: NotificationService,
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const rawBody = (req as unknown as { rawBody: Buffer }).rawBody;
    if (rawBody?.length > MAX_WEBHOOK_BODY_BYTES) {
      return res.status(413).json({ error: 'Request body too large' });
    }

    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    let event: ReturnType<typeof this.stripeService.constructWebhookEvent>;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    this.logger.log({
      category: 'payment',
      event: 'webhook.received',
      type: event.type,
    });

    try {
      switch (event.type) {
        case 'invoice.paid': {
          await this.handleInvoicePaid(
            event.data.object as unknown as Record<string, unknown>,
          );
          break;
        }
        case 'invoice.payment_failed': {
          await this.handleInvoiceFailed(
            event.data.object as unknown as Record<string, unknown>,
          );
          break;
        }
        case 'customer.subscription.deleted': {
          await this.handleSubscriptionDeleted(
            event.data.object as unknown as Record<string, unknown>,
          );
          break;
        }
        case 'customer.subscription.updated': {
          await this.handleSubscriptionUpdated(
            event.data.object as unknown as Record<string, unknown>,
          );
          break;
        }
        case 'subscription_schedule.released':
        case 'subscription_schedule.canceled':
        case 'subscription_schedule.aborted': {
          await this.handleScheduleEnded(
            event.data.object as unknown as Record<string, unknown>,
          );
          break;
        }
      }
    } catch (err) {
      this.logger.error(
        {
          category: 'payment',
          event: 'webhook.error',
          error: (err as Error).message,
        },
        `Webhook handler error: ${(err as Error).message}`,
      );
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ received: true });
  }

  private async handleInvoicePaid(invoice: Record<string, unknown>) {
    const customerId = invoice['customer'] as string;
    const subscriptionId = invoice['subscription'] as string;
    const invoiceId = invoice['id'] as string;
    const invoiceUrl = (invoice['hosted_invoice_url'] as string) ?? null;
    // Stripe reports amount_paid in cents — keep it in cents to match the
    // wallet's unit; the UI divides by 100 for display.
    const amountPaid = invoice['amount_paid'] as number;
    const currency = (invoice['currency'] as string) ?? 'usd';
    const paymentIntentId = (invoice['payment_intent'] as string) ?? null;

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!user) {
      this.logger.warn(
        {
          category: 'payment',
          event: 'payment.customer_not_found',
          customerId,
        },
        `No user found for Stripe customer ${customerId}`,
      );
      return;
    }

    // Reconcile the tier with what Stripe actually billed (covers mid-cycle
    // switches): the paid price defines the tier.
    const billedTier = await this.getBilledTier(subscriptionId);
    const effectiveTier = billedTier ?? user.subscriptionTier;

    const periodEnd = (invoice['period_end'] as number)
      ? new Date((invoice['period_end'] as number) * 1000)
      : null;

    // Four causally-related writes — the wallet ledger row, the period-end/
    // subscriptionId update, the tier reconciliation, and the pendingTier
    // clear — used to be separate top-level statements. A crash or
    // exception between them could leave the ledger showing a reconciled
    // tier that User.subscriptionTier didn't yet reflect, with nothing
    // (no cron/reconciliation job exists anywhere in this app) to catch a
    // mismatch that outlives Stripe's own webhook-retry window. One
    // transaction makes them succeed or fail together; upsertInvoiceTransaction's
    // own idempotency-key lookup already makes the whole handler safe to
    // retry from scratch on a Stripe redelivery.
    await this.prisma.$transaction(async (tx) => {
      const wallet = await this.wallet.ensureWallet(user.id, tx);
      await this.upsertInvoiceTransaction(tx, {
        idempotencyKey: `stripe_invoice:${invoiceId}`,
        walletId: wallet.id,
        invoiceId,
        subscriptionId,
        effectiveTier,
        amountPaid,
        currency: currency.toUpperCase(),
        paymentIntentId,
        invoiceUrl,
      });

      if (periodEnd) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            subscriptionPeriodEnd: periodEnd,
            // Never null out an existing subscription with a non-subscription
            // invoice (e.g. a setup intent invoice).
            ...(subscriptionId
              ? { stripeSubscriptionId: subscriptionId }
              : {}),
          },
        });
      }

      // The billed tier may have changed (mid-cycle switch, or a previous
      // attempt that never persisted) — converge the user's tier on it.
      if (billedTier && billedTier !== user.subscriptionTier) {
        await tx.user.update({
          where: { id: user.id },
          data: { subscriptionTier: billedTier as never },
        });
        this.logger.log(
          {
            category: 'billing',
            event: 'billing.tier_reconciled',
            userId: user.id,
            from: user.subscriptionTier,
            to: billedTier,
          },
          `Reconciled user ${user.id} tier to ${billedTier}`,
        );
      }

      // A scheduled paid<->paid change (see BillingService.handleTierChange)
      // has now been billed — clear the pending markers so the UI stops
      // showing "changing to X on <date>".
      if (user.pendingTier && billedTier && billedTier === user.pendingTier) {
        await tx.user.update({
          where: { id: user.id },
          data: { pendingTier: null, pendingTierEffectiveAt: null },
        });
      }
    });

    // Redis, not Postgres — deliberately outside the transaction above (it
    // isn't rolled back by a DB failure and shouldn't gate on one either).
    if (billedTier && billedTier !== user.subscriptionTier) {
      await this.tokenStore.rewriteFieldsForUser(user.id, {
        tier: billedTier,
      });
    }

    this.logger.log(
      {
        category: 'payment',
        event: 'payment.invoice_paid',
        userId: user.id,
        invoiceId,
        amountPaid,
        currency,
      },
      `Recorded invoice ${invoiceId} for user ${user.id}: $${(amountPaid / 100).toFixed(2)} ${currency}`,
    );
  }

  private async handleInvoiceFailed(invoice: Record<string, unknown>) {
    const customerId = invoice['customer'] as string;
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!user) {
      this.logger.warn(
        {
          category: 'payment',
          event: 'payment.customer_not_found',
          customerId,
        },
        `No user found for Stripe customer ${customerId}`,
      );
      return;
    }

    // Immediate-downgrade dunning policy: a failed renewal charge cuts paid
    // access now. Stripe keeps its own retry schedule running, so a later
    // successful retry reconciles the tier back up via invoice.paid.
    if (user.subscriptionTier === 'FREE') {
      return;
    }

    // If the failed charge was a scheduled change's own renewal, the change is
    // definitively dead — release its schedule and clear the pending markers
    // so the UI stops claiming it is still coming.
    if (user.stripeSubscriptionScheduleId) {
      await this.stripeService
        .releaseSubscriptionSchedule(user.stripeSubscriptionScheduleId)
        .catch((err: Error) =>
          this.logger.warn(
            {
              category: 'billing',
              event: 'billing.schedule_release_failed',
              userId: user.id,
              error: err.message,
            },
            `Failed to release schedule for user ${user.id}: ${err.message}`,
          ),
        );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'FREE',
        cancelAtPeriodEnd: false,
        pendingTier: null,
        pendingTierEffectiveAt: null,
        stripeSubscriptionScheduleId: null,
      },
    });
    await this.tokenStore.rewriteFieldsForUser(user.id, { tier: 'FREE' });

    await this.notification
      .create({
        userId: user.id,
        actorId: null,
        type: 'BILLING',
        title: 'Payment failed',
        body: 'Your recent payment failed — your subscription has been downgraded to FREE.',
      })
      .catch((err: Error) =>
        this.logger.warn(
          {
            category: 'billing',
            event: 'billing.notification_failed',
            error: err.message,
          },
          `Billing notification failed: ${err.message}`,
        ),
      );

    this.logger.warn(
      {
        category: 'payment',
        event: 'payment.invoice_failed',
        userId: user.id,
        invoiceId: invoice['id'],
      },
      `Payment failed for user ${user.id} on invoice ${String(invoice['id'])} — downgraded to FREE`,
    );
  }

  private async getBilledTier(
    subscriptionId: string | null,
  ): Promise<string | null> {
    if (!subscriptionId) return null;
    const subscription =
      await this.stripeService.getSubscription(subscriptionId);
    const priceId = subscription?.items?.data?.[0]?.price?.id;
    if (!priceId) return null;
    return this.stripeService.getTierForPriceId(priceId);
  }

  private async upsertInvoiceTransaction(
    tx: Prisma.TransactionClient,
    params: {
      idempotencyKey: string;
      walletId: string;
      invoiceId: string;
      subscriptionId: string | null;
      effectiveTier: string;
      amountPaid: number;
      currency: string;
      paymentIntentId: string | null;
      invoiceUrl: string | null;
    },
  ) {
    const data: {
      type: 'FEE';
      status: 'COMPLETED';
      amount: number;
      currency: string;
      stripePaymentIntentId: string | null;
      stripeInvoiceUrl: string | null;
      fromWalletId: string;
      reference: string;
      metadata: Prisma.InputJsonValue;
    } = {
      type: 'FEE',
      status: 'COMPLETED',
      amount: params.amountPaid,
      currency: params.currency,
      stripePaymentIntentId: params.paymentIntentId,
      stripeInvoiceUrl: params.invoiceUrl,
      fromWalletId: params.walletId,
      reference: `subscription:${params.effectiveTier}`,
      metadata: {
        invoiceId: params.invoiceId,
        subscriptionId: params.subscriptionId,
        tier: params.effectiveTier,
        provider: 'stripe',
      },
    };

    const existing = await tx.walletTransaction.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });
    if (existing) {
      // Re-delivery of the same invoice (webhook retry): reconcile the row
      // instead of creating a duplicate.
      await tx.walletTransaction.update({
        where: { idempotencyKey: params.idempotencyKey },
        data: {
          ...data,
          metadata: {
            ...(existing.metadata as Record<string, unknown> | null),
            ...(data.metadata as Record<string, unknown>),
          } as Prisma.InputJsonValue,
        },
      });
      return;
    }

    await tx.walletTransaction.create({
      data: {
        ...data,
        idempotencyKey: params.idempotencyKey,
      },
    });
  }

  private async handleSubscriptionDeleted(
    subscription: Record<string, unknown>,
  ) {
    const customerId = subscription['customer'] as string;
    const deletedSubscriptionId = subscription['id'] as string;
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: {
        id: true,
        stripeSubscriptionId: true,
        subscriptionTier: true,
      },
    });
    if (!user) return;

    // An upgrade cancels the old subscription before creating the replacement;
    // by the time this webhook lands the user points at the new one. Only
    // downgrade to FREE if no replacement was provisioned.
    if (user.stripeSubscriptionId !== deletedSubscriptionId) {
      this.logger.log(
        {
          category: 'billing',
          event: 'billing.subscription_deleted_skipped',
          userId: user.id,
          deletedSubscriptionId,
          activeSubscriptionId: user.stripeSubscriptionId,
        },
        `Skipped FREE downgrade for user ${user.id} — replacement subscription ${user.stripeSubscriptionId} is active`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: 'FREE',
          stripeSubscriptionId: null,
          subscriptionPeriodStart: null,
          subscriptionPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: user.id,
          eventType: 'billing.subscription_deleted',
          action: 'UPDATE',
          actorId: user.id,
          summary: 'Subscription deleted, reverted to FREE',
          after: { tier: 'FREE' },
        },
        tx,
      );
    });

    await this.tokenStore.rewriteFieldsForUser(user.id, {
      tier: 'FREE',
    });
    this.logger.log(
      {
        category: 'billing',
        event: 'billing.subscription_deleted',
        userId: user.id,
      },
      `Downgraded user ${user.id} to FREE (subscription deleted)`,
    );
  }

  private async handleSubscriptionUpdated(
    subscription: Record<string, unknown>,
  ) {
    const customerId = subscription['customer'] as string;
    const cancelAtPeriodEnd =
      (subscription['cancel_at_period_end'] as boolean) ?? false;
    const currentItem = (
      subscription['items'] as { data?: Array<{ current_period_end?: number }> }
    )?.data?.[0];
    const periodEnd = currentItem?.current_period_end
      ? new Date(currentItem.current_period_end * 1000)
      : null;

    // Dunning visibility: Stripe also delivers past_due/unpaid transitions via
    // this event. The actual downgrade is driven by invoice.payment_failed
    // (see handleInvoiceFailed) — surface these here so the failure is at
    // least observable in logs.
    const status = subscription['status'] as string | undefined;
    if (status === 'past_due' || status === 'unpaid') {
      this.logger.warn(
        {
          category: 'billing',
          event: 'billing.subscription_payment_delinquent',
          customerId,
          status,
        },
        `Subscription for customer ${customerId} is ${status}`,
      );
    }

    await this.prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        cancelAtPeriodEnd,
        // Only overwrite when we actually resolved a real date — never
        // clobber an existing correct value with null because this one
        // event's payload didn't have it (confirmed live: subscriptionPeriodEnd
        // was getting nulled on events with no item-level period data).
        ...(periodEnd ? { subscriptionPeriodEnd: periodEnd } : {}),
      },
    });
  }

  /**
   * A Subscription Schedule has ended (released, cancelled, or aborted) —
   * clear the locally-stored schedule id so the pending-change bookkeeping
   * can't go stale. Matches on the schedule's own id rather than the customer
   * id so an out-of-order event can never clobber a newer schedule.
   */
  private async handleScheduleEnded(schedule: Record<string, unknown>) {
    const scheduleId = schedule['id'] as string;
    if (!scheduleId) return;

    await this.prisma.user.updateMany({
      where: { stripeSubscriptionScheduleId: scheduleId },
      data: { stripeSubscriptionScheduleId: null },
    });
    this.logger.log(
      {
        category: 'billing',
        event: 'billing.subscription_schedule_ended',
        scheduleId,
      },
      `Subscription schedule ${scheduleId} ended, cleared stored schedule id`,
    );
  }
}
