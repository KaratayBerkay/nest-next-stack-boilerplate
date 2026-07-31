import { StripePaymentProvider } from './stripe-payment.provider';

type MockStripeService = {
  getPriceIdForTier: jest.Mock;
  createSubscription: jest.Mock;
  cancelSubscription: jest.Mock;
  cancelSubscriptionNow: jest.Mock;
  switchSubscription: jest.Mock;
};

describe('StripePaymentProvider', () => {
  let provider: StripePaymentProvider;
  let stripeService: MockStripeService;

  beforeEach(() => {
    stripeService = {
      getPriceIdForTier: jest.fn().mockReturnValue('price_basic'),
      createSubscription: jest.fn(),
      cancelSubscription: jest.fn().mockResolvedValue({}),
      cancelSubscriptionNow: jest.fn().mockResolvedValue({}),
      switchSubscription: jest.fn(),
    };
    provider = new StripePaymentProvider(stripeService as never);
  });

  describe('createSubscription', () => {
    it('creates the subscription with the mapped price and idempotency key', async () => {
      stripeService.createSubscription.mockResolvedValue({
        id: 'sub_1',
        items: {
          data: [
            {
              current_period_start: 1769817600,
              current_period_end: 1772496000,
            },
          ],
        },
        latest_invoice: 'inv_1',
      });

      const result = await provider.createSubscription({
        userId: 'u1',
        tier: 'BASIC' as never,
        paymentMethodId: 'pm_1',
        stripeCustomerId: 'cus_1',
        idempotencyKey: 'retry-key-1',
      });

      expect(stripeService.getPriceIdForTier).toHaveBeenCalledWith('BASIC');
      expect(stripeService.createSubscription).toHaveBeenCalledWith(
        'cus_1',
        'price_basic',
        'pm_1',
        'retry-key-1',
      );
      expect(result).toEqual({
        success: true,
        stripeSubscriptionId: 'sub_1',
        periodStart: new Date(1769817600 * 1000),
        periodEnd: new Date(1772496000 * 1000),
        latestInvoiceId: 'inv_1',
      });
    });

    it('returns a configuration error when no price is mapped', async () => {
      stripeService.getPriceIdForTier.mockReturnValue(null);

      const result = await provider.createSubscription({
        userId: 'u1',
        tier: 'BASIC' as never,
        paymentMethodId: 'pm_1',
        stripeCustomerId: 'cus_1',
      });

      expect(result).toEqual({ success: false, reason: 'configuration_error' });
      expect(stripeService.createSubscription).not.toHaveBeenCalled();
    });

    it('maps Stripe failures to a reason', async () => {
      stripeService.createSubscription.mockRejectedValue(
        new Error('Your card has insufficient funds'),
      );

      const result = await provider.createSubscription({
        userId: 'u1',
        tier: 'BASIC' as never,
        paymentMethodId: 'pm_1',
        stripeCustomerId: 'cus_1',
      });

      expect(result).toEqual({ success: false, reason: 'insufficient_funds' });
    });
  });

  describe('cancelSubscriptionNow', () => {
    it('delegates to the immediate cancel', async () => {
      await provider.cancelSubscriptionNow('sub_old');
      expect(stripeService.cancelSubscriptionNow).toHaveBeenCalledWith(
        'sub_old',
      );
    });
  });

  describe('switchSubscription', () => {
    it('switches the subscription to the mapped price', async () => {
      stripeService.switchSubscription.mockResolvedValue({
        id: 'sub_m',
        items: {
          data: [
            {
              current_period_start: 1769817600,
              current_period_end: 1772496000,
            },
          ],
        },
      });

      const result = await provider.switchSubscription({
        stripeSubscriptionId: 'sub_m',
        tier: 'BASIC' as never,
      });

      expect(stripeService.switchSubscription).toHaveBeenCalledWith(
        'sub_m',
        'price_basic',
      );
      expect(result).toEqual({
        success: true,
        stripeSubscriptionId: 'sub_m',
        periodStart: new Date(1769817600 * 1000),
        periodEnd: new Date(1772496000 * 1000),
      });
    });

    it('returns a configuration error when no price is mapped', async () => {
      stripeService.getPriceIdForTier.mockReturnValue(null);

      const result = await provider.switchSubscription({
        stripeSubscriptionId: 'sub_m',
        tier: 'BASIC' as never,
      });

      expect(result).toEqual({ success: false, reason: 'configuration_error' });
      expect(stripeService.switchSubscription).not.toHaveBeenCalled();
    });

    it('returns a failure when the switch throws', async () => {
      stripeService.switchSubscription.mockRejectedValue(
        new Error('subscription not found'),
      );

      const result = await provider.switchSubscription({
        stripeSubscriptionId: 'sub_m',
        tier: 'BASIC' as never,
      });

      expect(result).toEqual({
        success: false,
        reason: 'subscription_switch_failed',
      });
    });
  });
});
