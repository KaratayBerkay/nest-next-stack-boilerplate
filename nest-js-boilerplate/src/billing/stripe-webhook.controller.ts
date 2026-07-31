import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { StripeService } from './stripe/stripe.service';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { ConfigService } from '@nestjs/config';
import { OutboxService } from '../outbox/outbox.service';

const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024; // 1 MB

@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly wallet: WalletService,
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
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

    const wallet = await this.wallet.ensureWallet(user.id);
    await this.upsertInvoiceTransaction({
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
      await this.prisma.user.update({
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
      await this.prisma.user.update({
        where: { id: user.id },
        data: { subscriptionTier: billedTier as never },
      });
      await this.tokenStore.rewriteFieldsForUser(user.id, {
        tier: billedTier as never,
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
    if (user) {
      this.logger.warn(
        {
          category: 'payment',
          event: 'payment.invoice_failed',
          userId: user.id,
          invoiceId: invoice['id'],
        },
        `Payment failed for user ${user.id} on invoice ${String(invoice['id'])}`,
      );
    }
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

  private async upsertInvoiceTransaction(params: {
    idempotencyKey: string;
    walletId: string;
    invoiceId: string;
    subscriptionId: string | null;
    effectiveTier: string;
    amountPaid: number;
    currency: string;
    paymentIntentId: string | null;
    invoiceUrl: string | null;
  }) {
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

    const existing = await this.prisma.walletTransaction.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });
    if (existing) {
      // Re-delivery of the same invoice (webhook retry): reconcile the row
      // instead of creating a duplicate.
      await this.prisma.walletTransaction.update({
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

    await this.prisma.walletTransaction.create({
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
    const periodEnd = (subscription['current_period_end'] as number)
      ? new Date((subscription['current_period_end'] as number) * 1000)
      : null;

    await this.prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        cancelAtPeriodEnd,
        subscriptionPeriodEnd: periodEnd,
      },
    });
  }
}
