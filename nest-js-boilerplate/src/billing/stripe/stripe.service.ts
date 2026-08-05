import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  readonly stripe: Stripe;

  // Stripe Prices are effectively immutable at runtime (currency_options can
  // be added but existing amounts never change), so a per-tier cache avoids
  // a live API round-trip on every price read (e.g. every getSubscription
  // call) while still being the single real source of truth instead of a
  // hand-maintained env var table.
  private readonly priceInfoCache = new Map<string, Promise<Stripe.Price>>();

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
    currency?: string,
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
        // Selects which of the Price's currency_options to bill in. Only
        // meaningful at subscription-creation time — once a subscription
        // exists its currency is fixed, so tier changes on the same
        // subscription (scheduleSubscriptionChange below) never pass this.
        ...(currency ? { currency: currency.toLowerCase() } : {}),
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
   * Release a pending subscription schedule back to normal subscription
   * management (keeps the subscription alive — unlike `.cancel()`, which
   * would also cancel the underlying subscription).
   */
  async releaseSubscriptionSchedule(
    stripeSubscriptionScheduleId: string,
  ): Promise<Stripe.SubscriptionSchedule> {
    return this.stripe.subscriptionSchedules.release(
      stripeSubscriptionScheduleId,
    );
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
  ): Promise<{ scheduleId: string; effectiveAt: Date; currency: string }> {
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

    return {
      scheduleId: updated.id,
      effectiveAt: new Date(periodEnd * 1000),
      currency: subscription.currency.toUpperCase(),
    };
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

  private retrievePrice(priceId: string): Promise<Stripe.Price> {
    let cached = this.priceInfoCache.get(priceId);
    if (!cached) {
      // currency_options is an expandable field — omitted from the response
      // by default.
      cached = this.stripe.prices.retrieve(priceId, {
        expand: ['currency_options'],
      });
      this.priceInfoCache.set(priceId, cached);
      // Don't cache a rejected lookup — a transient Stripe/network error
      // shouldn't poison every subsequent read for the process lifetime.
      cached.catch(() => this.priceInfoCache.delete(priceId));
    }
    return cached;
  }

  /**
   * The single real source of truth for what a tier actually costs — reads
   * the live Stripe Price instead of a hand-maintained env var table (see
   * doc-11 F6). Pass `currency` to price it in a specific currency via the
   * Price's `currency_options`; falls back to the Price's own default
   * currency if that option isn't configured.
   */
  async getPriceInfoForTier(
    tier: string,
    currency?: string,
  ): Promise<{ cents: number; currency: string }> {
    const priceId = this.getPriceIdForTier(tier);
    if (!priceId)
      return { cents: 0, currency: (currency ?? 'USD').toUpperCase() };

    const price = await this.retrievePrice(priceId);
    const wanted = currency?.toLowerCase();
    const option =
      wanted && wanted !== price.currency
        ? price.currency_options?.[wanted]
        : undefined;

    if (option?.unit_amount != null) {
      return { cents: option.unit_amount, currency: wanted!.toUpperCase() };
    }
    return {
      cents: price.unit_amount ?? 0,
      currency: price.currency.toUpperCase(),
    };
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
