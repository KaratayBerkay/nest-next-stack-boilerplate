import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';

/** Measured average stored bytes per message letter (UTF-8 + envelope + row overhead). */
export const BYTES_PER_LETTER = 1.35;

/** Monthly message-storage allowance for FREE tier. */
export const FREE_MONTHLY_STORAGE_BYTES = 1024 * 1024;

/** Upload-storage allowance for FREE tier (250 MB of uploaded files). */
export const FREE_UPLOAD_STORAGE_BYTES = 250 * 1024 * 1024;

/** Every tier upgrade doubles the free allowance (FREE 1x, BASIC 2x, MEDIUM 4x, PREMIUM 8x). */
export const TIER_STORAGE_MULTIPLIER: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 1,
  [SubscriptionTier.BASIC]: 2,
  [SubscriptionTier.MEDIUM]: 4,
  [SubscriptionTier.PREMIUM]: 8,
};
