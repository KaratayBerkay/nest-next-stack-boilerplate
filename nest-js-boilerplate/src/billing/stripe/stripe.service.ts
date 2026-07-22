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
  ): Promise<Stripe.Subscription> {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      off_session: true,
    });
  }

  async cancelSubscription(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
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
