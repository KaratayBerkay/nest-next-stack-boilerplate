import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';

/**
 * Reuses the app-wide doubling convention (see usage.constants.ts's
 * TIER_STORAGE_MULTIPLIER) rather than inventing a new scaling rule:
 * FREE 1x, BASIC 2x, MEDIUM 4x, PREMIUM 8x.
 */
export const RTC_TIER_MULTIPLIER: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 1,
  [SubscriptionTier.BASIC]: 2,
  [SubscriptionTier.MEDIUM]: 4,
  [SubscriptionTier.PREMIUM]: 8,
};

/** 1:1 call max duration per tier (minutes). Deliberately NOT on the
 *  doubling convention: product-set values (2026-08-28) are
 *  FREE 10 / BASIC 25 / MEDIUM 45 / PREMIUM 120, and these are also what
 *  the in-call `elapsed / limit` timer displays. Applied against
 *  MIN(caller tier, callee tier) — a FREE caller can't inherit a PREMIUM
 *  callee's cap. */
export const CALL_MAX_DURATION_MINUTES: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 10,
  [SubscriptionTier.BASIC]: 25,
  [SubscriptionTier.MEDIUM]: 45,
  [SubscriptionTier.PREMIUM]: 120,
};

/** Meeting participant cap, FREE baseline — the host's tier decides the cap
 *  for everyone in the room. Doubles per tier:
 *  FREE 4 / BASIC 8 / MEDIUM 16 / PREMIUM 32. */
export const FREE_MEETING_MAX_PARTICIPANTS = 4;

/** Meeting max duration, FREE baseline (minutes) — doubles per tier:
 *  FREE 40 / BASIC 80 / MEDIUM 160 / PREMIUM 320. 40 minutes deliberately
 *  echoes Zoom's well-known free-tier cap as a recognizable product signal. */
export const FREE_MEETING_MAX_DURATION_MINUTES = 40;

/** Minimum tier required to broadcast (go live). Mirrors this app's
 *  existing @MinTier(MEDIUM) precedent (post.resolver.ts). Viewing/joining
 *  as an audience member is NOT gated — free for every tier. */
export const MIN_TIER_TO_GO_LIVE = SubscriptionTier.MEDIUM;

/** Single-tier call cap — the caller's own best case, shown pre-call
 *  (rtcTierLimits query). The binding cap for an actual call is
 *  callMaxDurationMinutes() below. */
export function callMaxDurationForTier(tier: SubscriptionTier): number {
  return (
    CALL_MAX_DURATION_MINUTES[tier] ??
    CALL_MAX_DURATION_MINUTES[SubscriptionTier.FREE]
  );
}

export function callMaxDurationMinutes(
  callerTier: SubscriptionTier,
  calleeTier: SubscriptionTier,
): number {
  return Math.min(
    callMaxDurationForTier(callerTier),
    callMaxDurationForTier(calleeTier),
  );
}

export function meetingMaxParticipants(hostTier: SubscriptionTier): number {
  return FREE_MEETING_MAX_PARTICIPANTS * (RTC_TIER_MULTIPLIER[hostTier] ?? 1);
}

export function meetingMaxDurationMinutes(hostTier: SubscriptionTier): number {
  return (
    FREE_MEETING_MAX_DURATION_MINUTES * (RTC_TIER_MULTIPLIER[hostTier] ?? 1)
  );
}
