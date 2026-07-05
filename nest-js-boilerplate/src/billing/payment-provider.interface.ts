import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';

export interface ChargeInput {
  userId: string;
  tier: SubscriptionTier;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface ChargeResult {
  approved: boolean;
  reason?: string;
  providerRef: string;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProvider {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
