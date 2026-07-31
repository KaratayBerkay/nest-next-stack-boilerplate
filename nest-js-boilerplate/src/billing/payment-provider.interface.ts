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

export interface SwitchSubscriptionInput {
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
}

export interface SwitchSubscriptionResult {
  success: boolean;
  reason?: string;
  stripeSubscriptionId?: string;
  periodStart?: Date;
  periodEnd?: Date;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProvider {
  createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult>;
  cancelSubscription(stripeSubscriptionId: string): Promise<void>;
  cancelSubscriptionNow(stripeSubscriptionId: string): Promise<void>;
  switchSubscription(
    input: SwitchSubscriptionInput,
  ): Promise<SwitchSubscriptionResult>;
}
