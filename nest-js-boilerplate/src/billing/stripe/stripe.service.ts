import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    const key = this.config.getOrThrow<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(key, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, name });
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string,
    idempotencyKey?: string,
  ): Promise<Stripe.Subscription> {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return this.stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        off_session: true,
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
  }

  async cancelSubscription(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /** Immediately cancel — used when a replacement subscription is being created. */
  async cancelSubscriptionNow(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  /**
   * Schedule a price change on the existing subscription for the next
   * renewal instead of applying it now: phase 1 keeps the current price
   * through the current period, phase 2 starts the new price at the
   * boundary with no proration. Reuses `existingScheduleId` if the
   * subscription already has a pending change so repeated calls update the
   * same schedule instead of creating a second one.
   */
  async scheduleSubscriptionChange(
    stripeSubscriptionId: string,
    existingScheduleId: string | null | undefined,
    newPriceId: string,
  ): Promise<{ scheduleId: string; effectiveAt: Date }> {
    const subscription =
      await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    const currentItem = subscription.items.data[0];
    const currentPriceId = currentItem.price.id;
    const periodStart = currentItem.current_period_start;
    const periodEnd = currentItem.current_period_end;

    const schedule = existingScheduleId
      ? await this.stripe.subscriptionSchedules.retrieve(existingScheduleId)
      : await this.stripe.subscriptionSchedules.create({
          from_subscription: stripeSubscriptionId,
        });

    const updated = await this.stripe.subscriptionSchedules.update(
      schedule.id,
      {
        end_behavior: 'release',
        phases: [
          {
            items: [{ price: currentPriceId }],
            start_date: periodStart,
            end_date: periodEnd,
            proration_behavior: 'none',
          },
          {
            items: [{ price: newPriceId }],
            start_date: periodEnd,
            proration_behavior: 'none',
          },
        ],
      },
    );

    return { scheduleId: updated.id, effectiveAt: new Date(periodEnd * 1000) };
  }

  async getSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription | null> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch {
      return null;
    }
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.retrieve(invoiceId);
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  getPriceIdForTier(tier: string): string | null {
    const key = `STRIPE_PRICE_${tier}`;
    return this.config.get<string>(key) ?? null;
  }

  /** Reverse lookup: which tier does a price belong to? */
  getTierForPriceId(priceId: string): string | null {
    const tiers = ['FREE', 'BASIC', 'MEDIUM', 'PREMIUM'];
    for (const tier of tiers) {
      if (this.getPriceIdForTier(tier) === priceId) return tier;
    }
    return null;
  }

  async listPaymentMethods(
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> {
    const result = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return result.data;
  }

  async detachPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  async retrieveCustomer(customerId: string): Promise<Stripe.Customer | null> {
    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer;
  }
}
