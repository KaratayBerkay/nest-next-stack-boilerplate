import { MockPaymentProvider } from './mock-payment.provider';

describe('MockPaymentProvider', () => {
  let provider: MockPaymentProvider;

  beforeEach(() => {
    provider = new MockPaymentProvider();
  });

  it('creates a subscription successfully', async () => {
    const result = await provider.createSubscription({
      userId: 'u1',
      tier: 'PREMIUM' as never,
      paymentMethodId: 'pm_test',
      stripeCustomerId: 'cus_test',
    });
    expect(result.success).toBe(true);
    expect(result.stripeSubscriptionId).toMatch(/^mock_sub_/);
    expect(result.periodStart).toBeInstanceOf(Date);
    expect(result.periodEnd).toBeInstanceOf(Date);
    expect(result.latestInvoiceId).toMatch(/^mock_inv_/);
  });

  it('cancelSubscription resolves without error', () => {
    expect(provider.cancelSubscription('sub_test')).resolves.toBeUndefined();
  });
});
