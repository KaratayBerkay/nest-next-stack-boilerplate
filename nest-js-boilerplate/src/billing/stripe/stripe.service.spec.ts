import { StripeService } from './stripe.service';

function buildService(env: Record<string, string> = {}) {
  const config = {
    getOrThrow: jest.fn().mockReturnValue('sk_test_dummy'),
    get: jest.fn((key: string) => env[key]),
  };
  const service = new StripeService(config as never);
  return service;
}

describe('StripeService', () => {
  describe('getPriceInfoForTier', () => {
    it('returns zero when no price is configured for the tier', async () => {
      const service = buildService();

      const result = await service.getPriceInfoForTier('BASIC');

      expect(result).toEqual({ cents: 0, currency: 'USD' });
    });

    it('returns the Price default amount/currency when no currency override is given', async () => {
      const service = buildService({ STRIPE_PRICE_BASIC: 'price_basic' });
      const retrieve = jest
        .spyOn(service.stripe.prices, 'retrieve')
        .mockResolvedValue({
          unit_amount: 999,
          currency: 'usd',
          currency_options: {
            eur: { unit_amount: 929 },
            try: { unit_amount: 34999 },
          },
        } as never);

      const result = await service.getPriceInfoForTier('BASIC');

      expect(retrieve).toHaveBeenCalledWith('price_basic', {
        expand: ['currency_options'],
      });
      expect(result).toEqual({ cents: 999, currency: 'USD' });
    });

    it('returns the matching currency_options entry when a non-default currency is requested', async () => {
      const service = buildService({ STRIPE_PRICE_BASIC: 'price_basic' });
      jest.spyOn(service.stripe.prices, 'retrieve').mockResolvedValue({
        unit_amount: 999,
        currency: 'usd',
        currency_options: {
          eur: { unit_amount: 929 },
          try: { unit_amount: 34999 },
        },
      } as never);

      const result = await service.getPriceInfoForTier('BASIC', 'EUR');

      expect(result).toEqual({ cents: 929, currency: 'EUR' });
    });

    it('falls back to the Price default when the requested currency has no currency_options entry', async () => {
      const service = buildService({ STRIPE_PRICE_BASIC: 'price_basic' });
      jest.spyOn(service.stripe.prices, 'retrieve').mockResolvedValue({
        unit_amount: 999,
        currency: 'usd',
        currency_options: {},
      } as never);

      const result = await service.getPriceInfoForTier('BASIC', 'GBP');

      expect(result).toEqual({ cents: 999, currency: 'USD' });
    });

    it('caches the Price lookup across repeated calls for the same tier', async () => {
      const service = buildService({ STRIPE_PRICE_BASIC: 'price_basic' });
      const retrieve = jest
        .spyOn(service.stripe.prices, 'retrieve')
        .mockResolvedValue({
          unit_amount: 999,
          currency: 'usd',
        } as never);

      await service.getPriceInfoForTier('BASIC');
      await service.getPriceInfoForTier('BASIC', 'EUR');

      expect(retrieve).toHaveBeenCalledTimes(1);
    });
  });

  describe('createSubscription', () => {
    it('omits the currency param when none is given', async () => {
      const service = buildService();
      jest
        .spyOn(service.stripe.paymentMethods, 'attach')
        .mockResolvedValue({} as never);
      const create = jest
        .spyOn(service.stripe.subscriptions, 'create')
        .mockResolvedValue({} as never);

      await service.createSubscription('cus_1', 'price_basic', 'pm_1');

      expect(create).toHaveBeenCalledWith(
        expect.not.objectContaining({ currency: expect.anything() as unknown }),
        undefined,
      );
    });

    it('lowercases and forwards a given currency', async () => {
      const service = buildService();
      jest
        .spyOn(service.stripe.paymentMethods, 'attach')
        .mockResolvedValue({} as never);
      const create = jest
        .spyOn(service.stripe.subscriptions, 'create')
        .mockResolvedValue({} as never);

      await service.createSubscription(
        'cus_1',
        'price_basic',
        'pm_1',
        undefined,
        'EUR',
      );

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'eur' }),
        undefined,
      );
    });
  });

  describe('scheduleSubscriptionChange', () => {
    it('surfaces the subscription currency alongside the schedule id/effective date', async () => {
      const service = buildService();
      const periodStart = 1769817600;
      const periodEnd = 1772496000;
      jest.spyOn(service.stripe.subscriptions, 'retrieve').mockResolvedValue({
        currency: 'try',
        items: {
          data: [
            {
              price: { id: 'price_basic' },
              current_period_start: periodStart,
              current_period_end: periodEnd,
            },
          ],
        },
      } as never);
      jest
        .spyOn(service.stripe.subscriptionSchedules, 'create')
        .mockResolvedValue({
          id: 'sched_1',
        } as never);
      jest
        .spyOn(service.stripe.subscriptionSchedules, 'update')
        .mockResolvedValue({
          id: 'sched_1',
        } as never);

      const result = await service.scheduleSubscriptionChange(
        'sub_1',
        null,
        'price_medium',
      );

      expect(result).toEqual({
        scheduleId: 'sched_1',
        effectiveAt: new Date(periodEnd * 1000),
        currency: 'TRY',
      });
    });
  });

  describe('getSubscription', () => {
    it('returns the live subscription on success', async () => {
      const service = buildService();
      const sub = { id: 'sub_1', status: 'active' };
      jest
        .spyOn(service.stripe.subscriptions, 'retrieve')
        .mockResolvedValue(sub as never);

      await expect(service.getSubscription('sub_1')).resolves.toEqual(sub);
    });

    it('returns null without logging for a genuine 404 (the subscription no longer exists on Stripe)', async () => {
      const service = buildService();
      jest.spyOn(service.stripe.subscriptions, 'retrieve').mockRejectedValue({
        code: 'resource_missing',
        message: 'No such subscription',
      });
      const warnSpy = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation(() => undefined);

      const result = await service.getSubscription('sub_gone');

      expect(result).toBeNull();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('logs a warning (still returning null) for a non-404 failure — regression: every failure was previously swallowed identically with zero logging, so a transient Stripe/network error looked indistinguishable from "this subscription genuinely no longer exists," silently showing a user with a live stripeSubscriptionId a generic default price instead of their actual one, with no trail to diagnose why', async () => {
      const service = buildService();
      jest
        .spyOn(service.stripe.subscriptions, 'retrieve')
        .mockRejectedValue(new Error('ECONNRESET'));
      const warnSpy = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation(() => undefined);

      const result = await service.getSubscription('sub_1');

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('ECONNRESET'),
      );
    });
  });
});
