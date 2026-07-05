import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { MockPaymentProvider } from './mock-payment.provider';

describe('MockPaymentProvider', () => {
  let provider: MockPaymentProvider;

  beforeEach(() => {
    provider = new MockPaymentProvider();
  });

  it('approves 4242 (test card)', async () => {
    const result = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.PREMIUM,
      last4: '4242',
      expMonth: 12,
      expYear: 2030,
    });
    expect(result.approved).toBe(true);
    expect(result.providerRef).toMatch(/^mock_/);
  });

  it('declines 0002 with generic_decline', async () => {
    const result = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.PREMIUM,
      last4: '0002',
      expMonth: 12,
      expYear: 2030,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('generic_decline');
  });

  it('declines 9995 with insufficient_funds', async () => {
    const result = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.PREMIUM,
      last4: '9995',
      expMonth: 12,
      expYear: 2030,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('insufficient_funds');
  });

  it('approves any last4 not in the documented decline list', async () => {
    // enhancements1 #9: there's no Luhn check on a 4-digit suffix (you can't
    // validate a partial PAN in isolation) — anything other than the 3 documented
    // decline numbers approves, so the mock isn't limited to one magic number.
    const result = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.BASIC,
      last4: '1230',
      expMonth: 12,
      expYear: 2030,
    });
    expect(result.approved).toBe(true);
  });

  it('approves an arbitrary last4 that would have failed the old fake Luhn check', async () => {
    // '0001' used to be rejected by the removed `luhnCheck('4242' + last4)` branch
    // (enhancements1 #9's bug) — confirms that logic is gone and this now approves
    // like any other undocumented last4.
    const result = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.BASIC,
      last4: '0001',
      expMonth: 12,
      expYear: 2030,
    });
    expect(result.approved).toBe(true);
  });

  it('returns a unique providerRef per call', async () => {
    const r1 = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.FREE,
      last4: '4242',
      expMonth: 1,
      expYear: 2030,
    });
    const r2 = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.FREE,
      last4: '4242',
      expMonth: 1,
      expYear: 2030,
    });
    expect(r1.providerRef).not.toBe(r2.providerRef);
  });
});
