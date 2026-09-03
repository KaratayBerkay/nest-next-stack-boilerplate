import { Injectable, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import { StripeService } from './stripe/stripe.service';
import {
  type PaymentProvider,
  type CreateSubscriptionInput,
  type CreateSubscriptionResult,
  type ScheduleTierChangeInput,
  type ScheduleTierChangeResult,
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
        input.currency,
      );

      // BE-019: with payment_behavior=allow_incomplete a first invoice that
      // needs SCA (or a declined card) no longer throws — it comes back as
      // an `incomplete` subscription.
      if (subscription.status === 'incomplete') {
        return this.resolveIncomplete(subscription, true);
      }
      return this.toSuccess(subscription);
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
            : msg.includes('authentication_required')
              ? 'authentication_required'
              : 'subscription_failed',
      };
    }
  }

  private toSuccess(
    subscription: Stripe.Subscription,
  ): CreateSubscriptionResult {
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
      currency: subscription.currency.toUpperCase(),
    };
  }

  private firstInvoiceSecret(subscription: Stripe.Subscription): string | null {
    const invoice = subscription.latest_invoice;
    if (!invoice || typeof invoice === 'string') return null;
    return invoice.confirmation_secret?.client_secret ?? null;
  }

  /**
   * BE-019: an `incomplete` first subscription is one of two things — its
   * PaymentIntent needs the customer's authentication (3DS/SCA), in which
   * case the client secret goes back to the client to confirm on-session
   * and `finalizeSubscription` provisions afterwards; or the card was
   * declined outright, which maps to the same reasons as before. A declined
   * subscription created by this call is cancelled straight away so the
   * customer can simply retry with another card (Stripe would otherwise
   * keep it `incomplete` for 23h).
   */
  private async resolveIncomplete(
    subscription: Stripe.Subscription,
    cancelOnDecline: boolean,
  ): Promise<CreateSubscriptionResult> {
    const clientSecret = this.firstInvoiceSecret(subscription);
    const intent = clientSecret
      ? await this.stripeService
          .getPaymentIntentState(clientSecret)
          .catch(() => null)
      : null;
    const needsAction =
      !!clientSecret &&
      (!intent ||
        ['requires_action', 'requires_confirmation', 'processing'].includes(
          intent.status,
        ));
    if (needsAction) {
      this.logger.log(
        {
          category: 'payment',
          event: 'payment.authentication_required',
          stripeSubscriptionId: subscription.id,
        },
        `Stripe subscription ${subscription.id} needs customer authentication`,
      );
      return {
        success: false,
        reason: 'authentication_required',
        clientSecret: clientSecret!,
        stripeSubscriptionId: subscription.id,
      };
    }
    if (cancelOnDecline) {
      await this.stripeService
        .cancelSubscriptionNow(subscription.id)
        .catch(() => undefined);
    }
    return {
      success: false,
      reason:
        intent?.declineCode === 'insufficient_funds'
          ? 'insufficient_funds'
          : 'declined',
    };
  }

  async finalizeSubscription(
    stripeSubscriptionId: string,
  ): Promise<CreateSubscriptionResult> {
    const subscription =
      await this.stripeService.retrieveSubscriptionForFinalize(
        stripeSubscriptionId,
      );
    if (
      subscription.status === 'active' ||
      subscription.status === 'trialing'
    ) {
      return this.toSuccess(subscription);
    }
    if (subscription.status === 'incomplete') {
      return this.resolveIncomplete(subscription, false);
    }
    return { success: false, reason: 'subscription_failed' };
  }

  async cancelSubscription(
    stripeSubscriptionId: string,
  ): Promise<{ currency: string }> {
    const subscription =
      await this.stripeService.cancelSubscription(stripeSubscriptionId);
    return { currency: subscription.currency.toUpperCase() };
  }

  async cancelSubscriptionNow(stripeSubscriptionId: string): Promise<void> {
    await this.stripeService.cancelSubscriptionNow(stripeSubscriptionId);
  }

  async releaseSubscriptionSchedule(
    stripeSubscriptionScheduleId: string,
  ): Promise<void> {
    await this.stripeService.releaseSubscriptionSchedule(
      stripeSubscriptionScheduleId,
    );
  }

  async scheduleTierChange(
    input: ScheduleTierChangeInput,
  ): Promise<ScheduleTierChangeResult> {
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
      const result = await this.stripeService.scheduleSubscriptionChange(
        input.stripeSubscriptionId,
        input.stripeSubscriptionScheduleId,
        priceId,
      );
      return {
        success: true,
        stripeSubscriptionScheduleId: result.scheduleId,
        effectiveAt: result.effectiveAt,
        currency: result.currency,
      };
    } catch (err) {
      const msg = (err as Error).message ?? 'subscription_schedule_failed';
      this.logger.error(
        {
          category: 'payment',
          event: 'payment.subscription_schedule_failed',
          error: msg,
        },
        `Stripe subscription schedule failed: ${msg}`,
      );
      return { success: false, reason: 'subscription_schedule_failed' };
    }
  }
}
