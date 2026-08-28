import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import {
  CALL_MAX_DURATION_MINUTES,
  callMaxDurationForTier,
  callMaxDurationMinutes,
} from './rtc-tier-limits.constants';

// Product-set 1:1 call caps (2026-08-28): 10 / 25 / 45 / 120 minutes.
// These are user-visible — the in-call timer renders `elapsed / limit` from
// the same values — so a silent change here changes what users are promised.
describe('call duration tier caps', () => {
  it('pins the product values per tier', () => {
    expect(CALL_MAX_DURATION_MINUTES).toEqual({
      [SubscriptionTier.FREE]: 10,
      [SubscriptionTier.BASIC]: 25,
      [SubscriptionTier.MEDIUM]: 45,
      [SubscriptionTier.PREMIUM]: 120,
    });
  });

  it('caps a call at the LOWER of the two parties (FREE caller cannot inherit a PREMIUM cap)', () => {
    expect(
      callMaxDurationMinutes(SubscriptionTier.FREE, SubscriptionTier.PREMIUM),
    ).toBe(10);
    expect(
      callMaxDurationMinutes(SubscriptionTier.PREMIUM, SubscriptionTier.BASIC),
    ).toBe(25);
    expect(
      callMaxDurationMinutes(
        SubscriptionTier.PREMIUM,
        SubscriptionTier.PREMIUM,
      ),
    ).toBe(120);
  });

  it('falls back to the FREE cap for an unknown tier value', () => {
    expect(callMaxDurationForTier('???' as SubscriptionTier)).toBe(10);
  });
});
