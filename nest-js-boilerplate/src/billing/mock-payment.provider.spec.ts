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

  it('approves other Luhn-valid last4', async () => {
    // 42421230 is Luhn-valid (4242 + 1230)
    const result = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.BASIC,
      last4: '1230',
      expMonth: 12,
      expYear: 2030,
    });
    expect(result.approved).toBe(true);
  });

  it('declines Luhn-invalid last4 with invalid_card', async () => {
    // 42420001 is NOT Luhn-valid
    const result = await provider.charge({
      userId: 'u1',
      tier: SubscriptionTier.BASIC,
      last4: '0001',
      expMonth: 12,
      expYear: 2030,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('invalid_card');
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
