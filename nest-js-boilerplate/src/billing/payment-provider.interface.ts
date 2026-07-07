import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';

export interface CreateSubscriptionInput {
  userId: string;
  tier: SubscriptionTier;
  paymentMethodId: string;
  stripeCustomerId: string;
}

export interface CreateSubscriptionResult {
  success: boolean;
  reason?: string;
  stripeSubscriptionId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  latestInvoiceId?: string;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProvider {
  createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult>;
  cancelSubscription(stripeSubscriptionId: string): Promise<void>;
}
