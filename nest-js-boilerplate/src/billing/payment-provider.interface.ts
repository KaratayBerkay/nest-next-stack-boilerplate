import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';

export interface CreateSubscriptionInput {
  userId: string;
  tier: SubscriptionTier;
  paymentMethodId: string;
  stripeCustomerId: string;
  idempotencyKey?: string;
  /** ISO 4217 code (e.g. "USD"/"EUR"/"TRY"). Only meaningful here — an
   * existing subscription's currency is fixed for its lifetime, so
   * ScheduleTierChangeInput below never takes one. */
  currency?: string;
}

export interface CreateSubscriptionResult {
  success: boolean;
  reason?: string;
  stripeSubscriptionId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  latestInvoiceId?: string;
  /** The currency actually charged, per Stripe's response — always present
   * on success. */
  currency?: string;
  /** BE-019: set together with reason 'authentication_required' — the first
   * invoice's PaymentIntent client secret the customer must confirm
   * on-session (3DS/SCA) before `finalizeSubscription` can provision. */
  clientSecret?: string;
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
  /** The subscription's existing (fixed-at-creation) currency — not a new
   * selection, just surfaced so ledger writes can record it accurately. */
  currency?: string;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProvider {
  createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult>;
  /**
   * BE-019: re-read a subscription whose first invoice needed customer
   * authentication. Resolves to the same success payload as
   * createSubscription once the customer completed 3DS, or to
   * `authentication_required` again (with a fresh clientSecret) while it is
   * still pending, or to a decline reason if the confirmation failed.
   */
  finalizeSubscription(
    stripeSubscriptionId: string,
  ): Promise<CreateSubscriptionResult>;
  /** Returns the subscription's currency so the caller's ledger write can
   * record it accurately instead of assuming USD. */
  cancelSubscription(
    stripeSubscriptionId: string,
  ): Promise<{ currency: string }>;
  cancelSubscriptionNow(stripeSubscriptionId: string): Promise<void>;
  /**
   * Release a pending subscription schedule without cancelling the underlying
   * subscription — used when a scheduled change is cancelled (either by the
   * user cancelling the subscription outright, or by re-selecting the current
   * tier while a change is pending).
   */
  releaseSubscriptionSchedule(
    stripeSubscriptionScheduleId: string,
  ): Promise<void>;
  /** Schedules a paid<->paid tier change for the next renewal (no immediate charge). */
  scheduleTierChange(
    input: ScheduleTierChangeInput,
  ): Promise<ScheduleTierChangeResult>;
}
