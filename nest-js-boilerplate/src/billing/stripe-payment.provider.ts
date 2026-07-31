import { Injectable, Logger } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import {
  type PaymentProvider,
  type CreateSubscriptionInput,
  type CreateSubscriptionResult,
  type SwitchSubscriptionInput,
  type SwitchSubscriptionResult,
} from './payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);

  constructor(private readonly stripeService: StripeService) {}

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    const customerId = input.stripeCustomerId;
    const priceId = this.stripeService.getPriceIdForTier(input.tier);
    if (!priceId) {
      this.logger.error(
        {
          category: 'payment',
          event: 'payment.missing_price',
          tier: input.tier,
        },
        `No Stripe price ID configured for tier ${input.tier}`,
      );
      return { success: false, reason: 'configuration_error' };
    }

    try {
      const subscription = await this.stripeService.createSubscription(
        customerId,
        priceId,
        input.paymentMethodId,
        input.idempotencyKey,
      );

      return {
        success: true,
        stripeSubscriptionId: subscription.id,
        periodStart: new Date(
          subscription.items.data[0]?.current_period_start * 1000,
        ),
        periodEnd: new Date(
          subscription.items.data[0]?.current_period_end * 1000,
        ),
        latestInvoiceId:
          typeof subscription.latest_invoice === 'string'
            ? subscription.latest_invoice
            : subscription.latest_invoice?.id,
      };
    } catch (err) {
      const msg = (err as Error).message ?? 'subscription_failed';
      this.logger.error(
        {
          category: 'payment',
          event: 'payment.subscription_failed',
          error: msg,
        },
        `Stripe subscription failed: ${msg}`,
      );
      return {
        success: false,
        reason: msg.includes('insufficient funds')
          ? 'insufficient_funds'
          : msg.includes('card_declined')
            ? 'declined'
            : 'subscription_failed',
      };
    }
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    await this.stripeService.cancelSubscription(stripeSubscriptionId);
  }

  async cancelSubscriptionNow(stripeSubscriptionId: string): Promise<void> {
    await this.stripeService.cancelSubscriptionNow(stripeSubscriptionId);
  }

  async switchSubscription(
    input: SwitchSubscriptionInput,
  ): Promise<SwitchSubscriptionResult> {
    const priceId = this.stripeService.getPriceIdForTier(input.tier);
    if (!priceId) {
      this.logger.error(
        {
          category: 'payment',
          event: 'payment.missing_price',
          tier: input.tier,
        },
        `No Stripe price ID configured for tier ${input.tier}`,
      );
      return { success: false, reason: 'configuration_error' };
    }

    try {
      const subscription = await this.stripeService.switchSubscription(
        input.stripeSubscriptionId,
        priceId,
      );
      return {
        success: true,
        stripeSubscriptionId: subscription.id,
        periodStart: new Date(
          subscription.items.data[0]?.current_period_start * 1000,
        ),
        periodEnd: new Date(
          subscription.items.data[0]?.current_period_end * 1000,
        ),
      };
    } catch (err) {
      const msg = (err as Error).message ?? 'subscription_switch_failed';
      this.logger.error(
        {
          category: 'payment',
          event: 'payment.subscription_switch_failed',
          error: msg,
        },
        `Stripe subscription switch failed: ${msg}`,
      );
      return { success: false, reason: 'subscription_switch_failed' };
    }
  }
}
