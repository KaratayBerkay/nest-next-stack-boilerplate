import { StripePaymentProvider } from './stripe-payment.provider';

type MockStripeService = {
  getPriceIdForTier: jest.Mock;
  createSubscription: jest.Mock;
  cancelSubscription: jest.Mock;
  cancelSubscriptionNow: jest.Mock;
  scheduleSubscriptionChange: jest.Mock;
  releaseSubscriptionSchedule: jest.Mock;
  retrieveSubscriptionForFinalize: jest.Mock;
  getPaymentIntentState: jest.Mock;
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
      scheduleSubscriptionChange: jest.fn(),
      releaseSubscriptionSchedule: jest.fn().mockResolvedValue({}),
      retrieveSubscriptionForFinalize: jest.fn(),
      getPaymentIntentState: jest.fn(),
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
        currency: 'usd',
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
        undefined,
      );
      expect(result).toEqual({
        success: true,
        stripeSubscriptionId: 'sub_1',
        periodStart: new Date(1769817600 * 1000),
        periodEnd: new Date(1772496000 * 1000),
        latestInvoiceId: 'inv_1',
        currency: 'USD',
      });
    });

    it('forwards a non-default currency and returns it uppercased', async () => {
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
        currency: 'eur',
      });

      const result = await provider.createSubscription({
        userId: 'u1',
        tier: 'BASIC' as never,
        paymentMethodId: 'pm_1',
        stripeCustomerId: 'cus_1',
        idempotencyKey: 'retry-key-1',
        currency: 'EUR',
      });

      expect(stripeService.createSubscription).toHaveBeenCalledWith(
        'cus_1',
        'price_basic',
        'pm_1',
        'retry-key-1',
        'EUR',
      );
      expect(result.currency).toBe('EUR');
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

  describe('cancelSubscription', () => {
    it('returns the subscription currency so callers can record it on the ledger', async () => {
      stripeService.cancelSubscription = jest
        .fn()
        .mockResolvedValue({ id: 'sub_old', currency: 'try' });

      const result = await provider.cancelSubscription('sub_old');

      expect(stripeService.cancelSubscription).toHaveBeenCalledWith('sub_old');
      expect(result).toEqual({ currency: 'TRY' });
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

  describe('releaseSubscriptionSchedule', () => {
    it('delegates to the Stripe schedule release', async () => {
      await provider.releaseSubscriptionSchedule('sub_sched_1');
      expect(stripeService.releaseSubscriptionSchedule).toHaveBeenCalledWith(
        'sub_sched_1',
      );
    });
  });

  describe('scheduleTierChange', () => {
    it('schedules the price change for the next renewal', async () => {
      const effectiveAt = new Date(1772496000 * 1000);
      stripeService.scheduleSubscriptionChange.mockResolvedValue({
        scheduleId: 'sub_sched_1',
        effectiveAt,
        currency: 'USD',
      });

      const result = await provider.scheduleTierChange({
        stripeSubscriptionId: 'sub_m',
        stripeSubscriptionScheduleId: null,
        tier: 'BASIC' as never,
      });

      expect(stripeService.scheduleSubscriptionChange).toHaveBeenCalledWith(
        'sub_m',
        null,
        'price_basic',
      );
      expect(result).toEqual({
        success: true,
        stripeSubscriptionScheduleId: 'sub_sched_1',
        effectiveAt,
        currency: 'USD',
      });
    });

    it('reuses an existing schedule id when one is already pending', async () => {
      stripeService.scheduleSubscriptionChange.mockResolvedValue({
        scheduleId: 'sub_sched_1',
        effectiveAt: new Date(1772496000 * 1000),
      });

      await provider.scheduleTierChange({
        stripeSubscriptionId: 'sub_m',
        stripeSubscriptionScheduleId: 'sub_sched_1',
        tier: 'BASIC' as never,
      });

      expect(stripeService.scheduleSubscriptionChange).toHaveBeenCalledWith(
        'sub_m',
        'sub_sched_1',
        'price_basic',
      );
    });

    it('returns a configuration error when no price is mapped', async () => {
      stripeService.getPriceIdForTier.mockReturnValue(null);

      const result = await provider.scheduleTierChange({
        stripeSubscriptionId: 'sub_m',
        tier: 'BASIC' as never,
      });

      expect(result).toEqual({ success: false, reason: 'configuration_error' });
      expect(stripeService.scheduleSubscriptionChange).not.toHaveBeenCalled();
    });

    it('returns a failure when the schedule call throws', async () => {
      stripeService.scheduleSubscriptionChange.mockRejectedValue(
        new Error('subscription not found'),
      );

      const result = await provider.scheduleTierChange({
        stripeSubscriptionId: 'sub_m',
        tier: 'BASIC' as never,
      });

      expect(result).toEqual({
        success: false,
        reason: 'subscription_schedule_failed',
      });
    });
  });

  // BE-019: payment_behavior=allow_incomplete — SCA and hard declines come
  // back as an `incomplete` subscription instead of a thrown error.
  describe('createSubscription — incomplete first invoice (BE-019)', () => {
    const incomplete = (secret: string | null) => ({
      id: 'sub_inc',
      status: 'incomplete',
      items: { data: [{ current_period_start: 1, current_period_end: 2 }] },
      latest_invoice: {
        id: 'inv_inc',
        confirmation_secret: secret
          ? { client_secret: secret, type: 'payment_intent' }
          : null,
      },
      currency: 'usd',
    });
    const input = {
      userId: 'u1',
      tier: 'BASIC' as never,
      paymentMethodId: 'pm_1',
      stripeCustomerId: 'cus_1',
    };

    it('returns authentication_required with the client secret when the PaymentIntent needs action', async () => {
      stripeService.createSubscription.mockResolvedValue(
        incomplete('pi_1_secret_x'),
      );
      stripeService.getPaymentIntentState.mockResolvedValue({
        status: 'requires_action',
        declineCode: null,
      });

      const result = await provider.createSubscription(input);

      expect(result).toEqual({
        success: false,
        reason: 'authentication_required',
        clientSecret: 'pi_1_secret_x',
        stripeSubscriptionId: 'sub_inc',
      });
      expect(stripeService.getPaymentIntentState).toHaveBeenCalledWith(
        'pi_1_secret_x',
      );
      expect(stripeService.cancelSubscriptionNow).not.toHaveBeenCalled();
    });

    it('maps a hard decline to the old reasons and cancels the dead subscription', async () => {
      stripeService.createSubscription.mockResolvedValue(
        incomplete('pi_2_secret_y'),
      );
      stripeService.getPaymentIntentState.mockResolvedValue({
        status: 'requires_payment_method',
        declineCode: 'insufficient_funds',
      });

      const result = await provider.createSubscription(input);

      expect(result).toEqual({ success: false, reason: 'insufficient_funds' });
      expect(stripeService.cancelSubscriptionNow).toHaveBeenCalledWith(
        'sub_inc',
      );
    });

    it('treats an incomplete subscription without a confirmation secret as declined', async () => {
      stripeService.createSubscription.mockResolvedValue(incomplete(null));
      const result = await provider.createSubscription(input);
      expect(result).toEqual({ success: false, reason: 'declined' });
      expect(stripeService.getPaymentIntentState).not.toHaveBeenCalled();
    });
  });

  describe('finalizeSubscription (BE-019)', () => {
    it('returns the success payload once the subscription is active', async () => {
      stripeService.retrieveSubscriptionForFinalize.mockResolvedValue({
        id: 'sub_inc',
        status: 'active',
        items: {
          data: [
            {
              current_period_start: 1769817600,
              current_period_end: 1772496000,
            },
          ],
        },
        latest_invoice: { id: 'inv_inc' },
        currency: 'eur',
      });

      const result = await provider.finalizeSubscription('sub_inc');

      expect(result).toEqual({
        success: true,
        stripeSubscriptionId: 'sub_inc',
        periodStart: new Date(1769817600 * 1000),
        periodEnd: new Date(1772496000 * 1000),
        latestInvoiceId: 'inv_inc',
        currency: 'EUR',
      });
    });

    it('reports authentication_required again while the PaymentIntent is still pending, without cancelling', async () => {
      stripeService.retrieveSubscriptionForFinalize.mockResolvedValue({
        id: 'sub_inc',
        status: 'incomplete',
        items: { data: [{ current_period_start: 1, current_period_end: 2 }] },
        latest_invoice: {
          id: 'inv_inc',
          confirmation_secret: {
            client_secret: 'pi_1_secret_x',
            type: 'payment_intent',
          },
        },
        currency: 'usd',
      });
      stripeService.getPaymentIntentState.mockResolvedValue({
        status: 'requires_action',
        declineCode: null,
      });

      const result = await provider.finalizeSubscription('sub_inc');

      expect(result.reason).toBe('authentication_required');
      expect(stripeService.cancelSubscriptionNow).not.toHaveBeenCalled();
    });

    it('reports subscription_failed for an expired/cancelled subscription', async () => {
      stripeService.retrieveSubscriptionForFinalize.mockResolvedValue({
        id: 'sub_inc',
        status: 'incomplete_expired',
        items: { data: [] },
        latest_invoice: null,
        currency: 'usd',
      });
      const result = await provider.finalizeSubscription('sub_inc');
      expect(result).toEqual({ success: false, reason: 'subscription_failed' });
    });
  });
});
