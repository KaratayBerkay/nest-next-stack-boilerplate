import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeService } from './stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { ConfigService } from '@nestjs/config';

@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    let event: ReturnType<typeof this.stripeService.constructWebhookEvent>;
    try {
      event = this.stripeService.constructWebhookEvent(
        (req as unknown as { rawBody: Buffer }).rawBody,
        signature,
      );
    } catch {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    try {
      switch (event.type) {
        case 'invoice.paid': {
          await this.handleInvoicePaid(event.data.object as unknown as Record<string, unknown>);
          break;
        }
        case 'invoice.payment_failed': {
          await this.handleInvoiceFailed(event.data.object as unknown as Record<string, unknown>);
          break;
        }
        case 'customer.subscription.deleted': {
          await this.handleSubscriptionDeleted(event.data.object as unknown as Record<string, unknown>);
          break;
        }
        case 'customer.subscription.updated': {
          await this.handleSubscriptionUpdated(event.data.object as unknown as Record<string, unknown>);
          break;
        }
      }
    } catch (err) {
      this.logger.error(`Webhook handler error: ${(err as Error).message}`);
    }

    res.json({ received: true });
  }

  private async handleInvoicePaid(invoice: Record<string, unknown>) {
    const customerId = invoice['customer'] as string;
    const subscriptionId = invoice['subscription'] as string;
    const invoiceId = invoice['id'] as string;
    const invoiceUrl = (invoice['hosted_invoice_url'] as string) ?? null;
    const amountPaid = Math.round((invoice['amount_paid'] as number) / 100);
    const currency = (invoice['currency'] as string) ?? 'usd';
    const paymentIntentId =
      (invoice['payment_intent'] as string) ?? null;

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!user) {
      this.logger.warn(`No user found for Stripe customer ${customerId}`);
      return;
    }

    const periodEnd = invoice['period_end'] as number
      ? new Date((invoice['period_end'] as number) * 1000)
      : null;

    const idempotencyKey = `stripe_invoice:${invoiceId}`;
    const existing = await this.prisma.walletTransaction.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return;

    const wallet = await this.ensureWallet(user.id);

    await this.prisma.walletTransaction.create({
      data: {
        type: 'FEE',
        status: 'COMPLETED',
        amount: amountPaid,
        currency: currency.toUpperCase(),
        idempotencyKey,
        reference: `subscription:${user.subscriptionTier}`,
        stripePaymentIntentId: paymentIntentId,
        stripeInvoiceUrl: invoiceUrl,
        fromWalletId: wallet.id,
        metadata: {
          invoiceId,
          subscriptionId,
          tier: user.subscriptionTier,
          provider: 'stripe',
        },
      },
    });

    if (periodEnd) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionPeriodEnd: periodEnd,
          stripeSubscriptionId: subscriptionId,
        },
      });
    }

    this.logger.log(
      `Recorded invoice ${invoiceId} for user ${user.id}: $${amountPaid} ${currency}`,
    );
  }

  private async handleInvoiceFailed(invoice: Record<string, unknown>) {
    const customerId = invoice['customer'] as string;
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (user) {
      this.logger.warn(
        `Payment failed for user ${user.id} on invoice ${invoice['id']}`,
      );
    }
  }

  private async handleSubscriptionDeleted(
    subscription: Record<string, unknown>,
  ) {
    const customerId = subscription['customer'] as string;
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!user) return;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'FREE',
        stripeSubscriptionId: null,
        subscriptionPeriodStart: null,
        subscriptionPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });

    await this.tokenStore.rewriteFieldsForUser(user.id, {
      tier: 'FREE' as never,
    });
    this.logger.log(`Downgraded user ${user.id} to FREE (subscription deleted)`);
  }

  private async handleSubscriptionUpdated(
    subscription: Record<string, unknown>,
  ) {
    const customerId = subscription['customer'] as string;
    const cancelAtPeriodEnd = (subscription['cancel_at_period_end'] as boolean) ?? false;
    const periodEnd = subscription['current_period_end'] as number
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

  private async ensureWallet(userId: string) {
    const existing = await this.prisma.wallet.findUnique({
      where: { userId_currency: { userId, currency: 'USD' } },
    });
    if (existing) return existing;
    return this.prisma.wallet.create({
      data: { userId, currency: 'USD', isPrimary: true },
    });
  }
}
