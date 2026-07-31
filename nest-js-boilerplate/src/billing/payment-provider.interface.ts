import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';

export interface CreateSubscriptionInput {
  userId: string;
  tier: SubscriptionTier;
  paymentMethodId: string;
  stripeCustomerId: string;
  idempotencyKey?: string;
}

export interface CreateSubscriptionResult {
  success: boolean;
  reason?: string;
  stripeSubscriptionId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  latestInvoiceId?: string;
}

export interface ScheduleTierChangeInput {
  stripeSubscriptionId: string;
  stripeSubscriptionScheduleId?: string | null;
  tier: SubscriptionTier;
}

export interface ScheduleTierChangeResult {
  success: boolean;
  reason?: string;
  stripeSubscriptionScheduleId?: string;
  effectiveAt?: Date;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProvider {
  createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult>;
  cancelSubscription(stripeSubscriptionId: string): Promise<void>;
  cancelSubscriptionNow(stripeSubscriptionId: string): Promise<void>;
  /** Schedules a paid<->paid tier change for the next renewal (no immediate charge). */
  scheduleTierChange(
    input: ScheduleTierChangeInput,
  ): Promise<ScheduleTierChangeResult>;
}
