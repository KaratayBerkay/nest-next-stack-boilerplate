import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';

/** Canonical tier rank map — single source of truth for tier ordering. */
export const TIER_RANK: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.BASIC]: 1,
  [SubscriptionTier.MEDIUM]: 2,
  [SubscriptionTier.PREMIUM]: 3,
};

/** Rank of the lowest tier that can access VIP WS rooms (MEDIUM = 2). */
export const MIN_TIER_FOR_VIP = TIER_RANK[SubscriptionTier.MEDIUM];

/** Safe tier-rank lookup that accepts any string and falls back to 0 (FREE). */
export function tierRank(tier: string): number {
  return TIER_RANK[tier as SubscriptionTier] ?? 0;
}
