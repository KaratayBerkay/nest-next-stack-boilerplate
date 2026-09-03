import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { CALL_MAX_DURATION_MINUTES } from '../rtc/rtc-tier-limits.constants';
import { TIER_STORAGE_MULTIPLIER } from '../usage/usage.constants';

/**
 * CROSS-031: the single source of truth for "what does each tier include".
 *
 * Clients used to keep their own hardcoded feature lists (web pricing copy,
 * web plans copy, a Dart list on mobile) that had drifted apart in wording,
 * count and even which tier a perk belonged to. The backend now publishes
 * the list per tier on `planPrices { features { key value } }`; clients own
 * only the *translation* of each key (`{value}` is interpolated), never the
 * list itself. Numeric perks are derived from the constants that actually
 * enforce them, so the marketing copy can't promise a limit the gates
 * don't grant.
 */
export interface TierFeature {
  /** Stable, client-translated identifier — see the clients' feature-label maps. */
  key: TierFeatureKey;
  /** Optional interpolation value (a number, or a tier name for `everythingIn`). */
  value?: string;
}

export type TierFeatureKey =
  | 'basicAccess'
  | 'communitySupport'
  | 'everythingIn'
  | 'prioritySupport'
  | 'basicAnalytics'
  | 'postStats'
  | 'vipRooms'
  | 'suggestedFriends'
  | 'whoReacted'
  | 'exportData'
  | 'crownBadge'
  | 'dedicatedSupport'
  | 'callMinutes'
  | 'storageMultiplier';

const callMinutes = (tier: SubscriptionTier): TierFeature => ({
  key: 'callMinutes',
  value: String(CALL_MAX_DURATION_MINUTES[tier]),
});

const storage = (tier: SubscriptionTier): TierFeature => ({
  key: 'storageMultiplier',
  value: String(TIER_STORAGE_MULTIPLIER[tier]),
});

export const TIER_FEATURES: Record<SubscriptionTier, readonly TierFeature[]> = {
  [SubscriptionTier.FREE]: [
    { key: 'basicAccess' },
    { key: 'communitySupport' },
    callMinutes(SubscriptionTier.FREE),
  ],
  [SubscriptionTier.BASIC]: [
    { key: 'everythingIn', value: SubscriptionTier.FREE },
    { key: 'prioritySupport' },
    { key: 'basicAnalytics' },
    callMinutes(SubscriptionTier.BASIC),
    storage(SubscriptionTier.BASIC),
  ],
  [SubscriptionTier.MEDIUM]: [
    { key: 'everythingIn', value: SubscriptionTier.BASIC },
    { key: 'postStats' },
    { key: 'vipRooms' },
    { key: 'suggestedFriends' },
    callMinutes(SubscriptionTier.MEDIUM),
    storage(SubscriptionTier.MEDIUM),
  ],
  [SubscriptionTier.PREMIUM]: [
    { key: 'everythingIn', value: SubscriptionTier.MEDIUM },
    { key: 'whoReacted' },
    { key: 'exportData' },
    { key: 'crownBadge' },
    { key: 'dedicatedSupport' },
    callMinutes(SubscriptionTier.PREMIUM),
    storage(SubscriptionTier.PREMIUM),
  ],
};

export function tierFeatures(tier: SubscriptionTier): TierFeature[] {
  return TIER_FEATURES[tier].map((f) => ({ ...f }));
}
