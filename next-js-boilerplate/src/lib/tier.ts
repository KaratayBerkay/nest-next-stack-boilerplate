// Tier ordering mirrors the backend at
// nest-js-boilerplate/src/authorization/tier.enum.ts — keep in sync.
//
// The backend is the source of truth; this module is a frontend convenience
// for render-only gating (TierGate, useMinTier). Every gated request still
// hits @MinTier on the backend.

export const TIERS = ["FREE", "BASIC", "MEDIUM", "PREMIUM"] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_ORDER: Record<Tier, number> = {
  FREE: 0,
  BASIC: 1,
  MEDIUM: 2,
  PREMIUM: 3,
};

export function tierAtLeast(
  userTier: string | null | undefined,
  min: Tier,
): boolean {
  if (!userTier) return false;
  const userRank = TIER_ORDER[userTier as Tier];
  if (userRank === undefined) return false;
  return userRank >= TIER_ORDER[min];
}

export function tierLabel(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

export const TIER_PRICES_CENTS: Record<Tier, number> = {
  FREE: 0,
  BASIC: 999,
  MEDIUM: 1999,
  PREMIUM: 4999,
};
