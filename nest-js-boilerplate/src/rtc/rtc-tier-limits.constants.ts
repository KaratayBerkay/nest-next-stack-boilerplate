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

/** 1:1 call max duration, FREE baseline (minutes) — doubles per tier:
 *  FREE 15 / BASIC 30 / MEDIUM 60 / PREMIUM 120. Applied against
 *  MIN(caller tier, callee tier) — a FREE caller can't inherit a PREMIUM
 *  callee's cap. */
export const FREE_CALL_MAX_DURATION_MINUTES = 15;

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

export function callMaxDurationMinutes(
  callerTier: SubscriptionTier,
  calleeTier: SubscriptionTier,
): number {
  const lowerMultiplier = Math.min(
    RTC_TIER_MULTIPLIER[callerTier] ?? 1,
    RTC_TIER_MULTIPLIER[calleeTier] ?? 1,
  );
  return FREE_CALL_MAX_DURATION_MINUTES * lowerMultiplier;
}

export function meetingMaxParticipants(hostTier: SubscriptionTier): number {
  return FREE_MEETING_MAX_PARTICIPANTS * (RTC_TIER_MULTIPLIER[hostTier] ?? 1);
}

export function meetingMaxDurationMinutes(hostTier: SubscriptionTier): number {
  return (
    FREE_MEETING_MAX_DURATION_MINUTES * (RTC_TIER_MULTIPLIER[hostTier] ?? 1)
  );
}
