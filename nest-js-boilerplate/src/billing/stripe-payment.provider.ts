import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { StripeService } from './stripe/stripe.service';
import {
  type PaymentProvider,
  type CreateSubscriptionInput,
  type CreateSubscriptionResult,
} from './payment-provider.interface';

const TIER_TO_PRICE_KEY: Record<SubscriptionTier, string> = {
  [SubscriptionTier.FREE]: '',
  [SubscriptionTier.BASIC]: 'STRIPE_PRICE_BASIC',
  [SubscriptionTier.MEDIUM]: 'STRIPE_PRICE_MEDIUM',
  [SubscriptionTier.PREMIUM]: 'STRIPE_PRICE_PREMIUM',
};

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);

  constructor(private readonly stripeService: StripeService) {}

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    const customerId = input.stripeCustomerId;
    const priceId = await this.stripeService.getPriceIdForTier(input.tier);
    if (!priceId) {
      this.logger.error(`No Stripe price ID configured for tier ${input.tier}`);
      return { success: false, reason: 'configuration_error' };
    }

    try {
      const subscription = await this.stripeService.createSubscription(
        customerId,
        priceId,
        input.paymentMethodId,
      );

      return {
        success: true,
        stripeSubscriptionId: subscription.id,
        periodStart: new Date(subscription.items.data[0]?.current_period_start! * 1000),
        periodEnd: new Date(subscription.items.data[0]?.current_period_end! * 1000),
        latestInvoiceId:
          typeof subscription.latest_invoice === 'string'
            ? subscription.latest_invoice
            : subscription.latest_invoice?.id,
      };
    } catch (err) {
      const msg = (err as Error).message ?? 'subscription_failed';
      this.logger.error(`Stripe subscription failed: ${msg}`);
      return {
        success: false,
        reason: msg.includes('insufficient_funds')
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
}
