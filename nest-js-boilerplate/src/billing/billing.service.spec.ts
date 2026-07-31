import { BadRequestException } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { BillingService } from './billing.service';

type MockPrisma = {
  user: {
    findUniqueOrThrow: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  wallet: { findUnique: jest.Mock; create: jest.Mock };
  walletTransaction: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  $transaction: jest.Mock;
  $executeRaw: jest.Mock;
};

interface MockPaymentProvider {
  createSubscription: jest.Mock;
  cancelSubscription: jest.Mock;
  cancelSubscriptionNow: jest.Mock;
  scheduleTierChange: jest.Mock;
}

type MockTokenStore = { rewriteFieldsForUser: jest.Mock };
type MockNotification = { create: jest.Mock };
type MockRealtime = { updateUserTier: jest.Mock };
type MockStripeService = {
  createCustomer: jest.Mock;
  createSetupIntent: jest.Mock;
};
type MockWallet = { ensureWallet: jest.Mock };

const SUB_USER = {
  subscriptionTier: SubscriptionTier.FREE,
  stripeCustomerId: 'cus_existing',
  email: 'user@example.com',
  name: 'Test',
  stripeSubscriptionId: null,
};

const SUB_RESULT = {
  success: true,
  stripeSubscriptionId: 'sub_abc',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-02-01'),
  latestInvoiceId: 'inv_1',
};

describe('BillingService', () => {
  let service: BillingService;
  let mockProvider: MockPaymentProvider;
  let mockPrisma: MockPrisma;
  let mockTokenStore: MockTokenStore;
  let mockNotification: MockNotification;
  let mockRealtime: MockRealtime;
  let mockStripe: MockStripeService;
  let mockWallet: MockWallet;

  beforeEach(() => {
    const createSubscription = jest.fn();
    const cancelSubscription = jest.fn().mockResolvedValue(undefined);
    const cancelSubscriptionNow = jest.fn().mockResolvedValue(undefined);
    const scheduleTierChange = jest.fn();
    mockProvider = {
      createSubscription,
      cancelSubscription,
      cancelSubscriptionNow,
      scheduleTierChange,
    };

    const findUniqueOrThrow = jest.fn();
    const findUnique = jest.fn();
    const update = jest.fn();
    const wFindUnique = jest
      .fn()
      .mockResolvedValue({ id: 'w1', userId: 'u1', currency: 'USD' });
    const wCreate = jest.fn();
    const wtCreate = jest.fn();
    const wtFindMany = jest.fn();
    const wtFindFirst = jest.fn().mockResolvedValue(null);
    const wtFindUnique = jest.fn().mockResolvedValue(null);
    const wtUpdate = jest.fn();
    const transaction = jest.fn(
      (cb: (tx: MockPrisma) => Promise<unknown>) => cb(mockPrisma),
    );
    const executeRaw = jest.fn().mockResolvedValue(0);
    mockPrisma = {
      user: { findUniqueOrThrow, findUnique, update },
      wallet: { findUnique: wFindUnique, create: wCreate },
      walletTransaction: {
        create: wtCreate,
        findMany: wtFindMany,
        findFirst: wtFindFirst,
        findUnique: wtFindUnique,
        update: wtUpdate,
      },
      $transaction: transaction,
      $executeRaw: executeRaw,
    };

    const rewriteFieldsForUser = jest.fn();
    mockTokenStore = { rewriteFieldsForUser };

    const createNotify = jest.fn();
    mockNotification = { create: createNotify };

    const updateUserTier = jest.fn();
    mockRealtime = { updateUserTier };

    const createCustomer = jest.fn().mockResolvedValue({ id: 'cus_new123' });
    const createSetupIntent = jest
      .fn()
      .mockResolvedValue({ client_secret: 'si_secret' });
    mockStripe = { createCustomer, createSetupIntent };

    mockWallet = {
      ensureWallet: jest
        .fn()
        .mockResolvedValue({ id: 'w1', userId: 'u1', currency: 'USD' }),
    };

    const mockOutbox = { emit: jest.fn().mockResolvedValue(undefined) };

    service = new BillingService(
      mockPrisma as never,
      mockTokenStore as never,
      mockNotification as never,
      mockRealtime as never,
      mockStripe as never,
      mockWallet as never,
      mockOutbox as never,
      mockProvider,
    );
  });

  describe('subscribeToPlan — upgrades', () => {
    it('upgrades tier on approved subscription', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockProvider.createSubscription.mockResolvedValue(SUB_RESULT);

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card123',
      );

      expect(result.success).toBe(true);
      expect(mockProvider.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          tier: SubscriptionTier.PREMIUM,
          paymentMethodId: 'pm_card123',
          stripeCustomerId: 'cus_existing',
          idempotencyKey: expect.any(String) as never,
        } satisfies Record<string, unknown>),
      );
      expect(mockTokenStore.rewriteFieldsForUser).toHaveBeenCalledWith('u1', {
        tier: SubscriptionTier.PREMIUM,
      });
      expect(mockRealtime.updateUserTier).toHaveBeenCalledWith(
        'u1',
        SubscriptionTier.PREMIUM,
      );
    });

    it('creates Stripe customer if user has none', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        stripeCustomerId: null,
      });
      mockProvider.createSubscription.mockResolvedValue({
        success: true,
        stripeSubscriptionId: 'sub_new',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-02-01'),
      });

      await service.subscribeToPlan('u1', SubscriptionTier.BASIC, 'pm_card');

      expect(mockStripe.createCustomer).toHaveBeenCalledWith(
        'user@example.com',
        'Test',
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { stripeCustomerId: 'cus_new123' },
      });
      expect(mockProvider.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          stripeCustomerId: 'cus_new123',
        } satisfies Record<string, unknown>),
      );
    });

    it('returns declined without changing tier', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockProvider.createSubscription.mockResolvedValue({
        success: false,
        reason: 'generic_decline',
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.BASIC,
        'pm_card',
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe('generic_decline');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
    });

    it('cancels a stray live subscription before establishing the first real one (defense in depth)', async () => {
      // A FREE-tier user should never have a live stripeSubscriptionId, but
      // this guards against corrupted/leftover state regardless.
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.FREE,
        stripeSubscriptionId: 'sub_old',
      });
      mockProvider.createSubscription.mockResolvedValue(SUB_RESULT);

      await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
      );

      expect(mockProvider.cancelSubscriptionNow).toHaveBeenCalledWith(
        'sub_old',
      );
      expect(mockProvider.createSubscription).toHaveBeenCalled();
    });

    it('aborts the first subscribe if cancelling a stray old subscription fails', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.FREE,
        stripeSubscriptionId: 'sub_old',
      });
      mockProvider.cancelSubscriptionNow.mockRejectedValue(
        new Error('stripe down'),
      );

      await expect(
        service.subscribeToPlan('u1', SubscriptionTier.PREMIUM, 'pm_card'),
      ).rejects.toThrow('stripe down');
      expect(mockProvider.createSubscription).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('defers a paid<->paid upgrade instead of charging immediately', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.BASIC,
        stripeSubscriptionId: 'sub_old',
      });
      mockProvider.scheduleTierChange.mockResolvedValue({
        success: true,
        stripeSubscriptionScheduleId: 'sub_sched_1',
        effectiveAt: new Date('2026-03-01'),
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
      );

      expect(result.success).toBe(true);
      expect(mockProvider.cancelSubscriptionNow).not.toHaveBeenCalled();
      expect(mockProvider.createSubscription).not.toHaveBeenCalled();
      expect(mockProvider.scheduleTierChange).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_old',
        stripeSubscriptionScheduleId: undefined,
        tier: SubscriptionTier.PREMIUM,
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pendingTier: SubscriptionTier.PREMIUM,
            pendingTierEffectiveAt: new Date('2026-03-01'),
            stripeSubscriptionScheduleId: 'sub_sched_1',
          }) as never,
        }) as never,
      );
      // The tier itself (and access) must not change until the boundary.
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
      expect(mockRealtime.updateUserTier).not.toHaveBeenCalled();
    });

    it('passes a client idempotency key and keys the first-invoice row by invoice', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockProvider.createSubscription.mockResolvedValue(SUB_RESULT);

      await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
        'retry-key-1',
      );

      expect(mockProvider.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ idempotencyKey: 'retry-key-1' }),
      );
      expect(mockPrisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            idempotencyKey: 'stripe_invoice:inv_1',
            clientIdempotencyKey: 'retry-key-1',
          }) as never,
        }) as never,
      );
    });

    it('dedupes a real retry via the stored client idempotency key', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockPrisma.walletTransaction.findFirst.mockResolvedValue({
        status: 'COMPLETED',
        metadata: null,
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
        'retry-key-1',
      );

      expect(mockPrisma.walletTransaction.findFirst).toHaveBeenCalledWith({
        where: { clientIdempotencyKey: 'retry-key-1' },
      });
      expect(result.success).toBe(true);
      expect(mockProvider.createSubscription).not.toHaveBeenCalled();
    });

    it('serializes concurrent upgrades with an advisory lock and skips an already-provisioned tier', async () => {
      mockPrisma.user.findUniqueOrThrow
        .mockResolvedValueOnce(SUB_USER)
        .mockResolvedValueOnce({
          ...SUB_USER,
          subscriptionTier: SubscriptionTier.BASIC,
          stripeSubscriptionId: 'sub_other',
          subscriptionPeriodEnd: new Date('2026-03-01'),
        });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.BASIC,
        'pm_card',
      );

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      expect(
        String(mockPrisma.$executeRaw.mock.calls[0]?.[0]?.[0] ?? ''),
      ).toContain('pg_advisory_xact_lock');
      expect(result.success).toBe(true);
      expect(result.periodEnd).toEqual(new Date('2026-03-01'));
      expect(mockProvider.createSubscription).not.toHaveBeenCalled();
      expect(mockProvider.cancelSubscriptionNow).not.toHaveBeenCalled();
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
    });

    it('cancels a just-created subscription if a concurrent one was already persisted', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockPrisma.user.findUnique.mockResolvedValue({
        stripeSubscriptionId: 'sub_other',
      });
      mockProvider.createSubscription.mockResolvedValue(SUB_RESULT);

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
      );

      expect(mockProvider.cancelSubscriptionNow).toHaveBeenCalledWith(
        'sub_abc',
      );
      expect(mockPrisma.walletTransaction.create).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('reconciles into the webhook-written invoice row instead of colliding', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockProvider.createSubscription.mockResolvedValue(SUB_RESULT);
      mockPrisma.walletTransaction.findUnique.mockResolvedValue({
        id: 'tx_webhook',
        idempotencyKey: 'stripe_invoice:inv_1',
        clientIdempotencyKey: null,
        status: 'COMPLETED',
        amount: 1999,
        metadata: { invoiceId: 'inv_1', tier: 'PREMIUM' },
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
        'retry-key-1',
      );

      expect(mockPrisma.walletTransaction.create).not.toHaveBeenCalled();
      expect(mockPrisma.walletTransaction.update).toHaveBeenCalledWith({
        where: { idempotencyKey: 'stripe_invoice:inv_1' },
        data: expect.objectContaining({
          clientIdempotencyKey: 'retry-key-1',
          reference: 'subscription:PREMIUM',
        }) as never,
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            subscriptionTier: SubscriptionTier.PREMIUM,
            stripeSubscriptionId: 'sub_abc',
          }) as never,
        }) as never,
      );
      expect(result.success).toBe(true);
    });

    it('returns the prior completed result for a duplicate idempotency key', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockPrisma.walletTransaction.findFirst.mockResolvedValue({
        status: 'COMPLETED',
        metadata: null,
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
        'retry-key-1',
      );

      expect(result.success).toBe(true);
      expect(mockProvider.createSubscription).not.toHaveBeenCalled();
    });

    it('returns the prior failed reason for a duplicate idempotency key', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);
      mockPrisma.walletTransaction.findFirst.mockResolvedValue({
        status: 'FAILED',
        metadata: { reason: 'declined' },
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card',
        'retry-key-1',
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe('declined');
      expect(mockProvider.createSubscription).not.toHaveBeenCalled();
    });

    it('throws if upgrade requested without paymentMethodId', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(SUB_USER);

      await expect(
        service.subscribeToPlan('u1', SubscriptionTier.PREMIUM),
      ).rejects.toThrow('paymentMethodId required for upgrades');
    });
  });

  describe('subscribeToPlan — downgrades', () => {
    it('schedules cancellation to FREE without cutting access', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.PREMIUM,
        stripeSubscriptionId: 'sub_prem',
      });

      const result = await service.subscribeToPlan('u1', SubscriptionTier.FREE);

      expect(result.success).toBe(true);
      expect(mockProvider.cancelSubscription).toHaveBeenCalledWith('sub_prem');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { cancelAtPeriodEnd: true },
      });
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
    });

    it('defers the change when downgrading to another paid tier instead of switching immediately', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.MEDIUM,
        stripeSubscriptionId: 'sub_m',
      });
      mockProvider.scheduleTierChange.mockResolvedValue({
        success: true,
        stripeSubscriptionScheduleId: 'sub_sched_1',
        effectiveAt: new Date('2026-02-01'),
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.BASIC,
      );

      expect(result.success).toBe(true);
      expect(result.periodEnd).toEqual(new Date('2026-02-01'));
      expect(mockProvider.scheduleTierChange).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_m',
        stripeSubscriptionScheduleId: undefined,
        tier: SubscriptionTier.BASIC,
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            pendingTier: SubscriptionTier.BASIC,
            pendingTierEffectiveAt: new Date('2026-02-01'),
            stripeSubscriptionScheduleId: 'sub_sched_1',
          }) as never,
        }) as never,
      );
      // Access/features stay on the current tier until the boundary.
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
      expect(mockRealtime.updateUserTier).not.toHaveBeenCalled();
    });

    it('reuses the existing schedule when a change is already pending', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.MEDIUM,
        stripeSubscriptionId: 'sub_m',
        stripeSubscriptionScheduleId: 'sub_sched_existing',
      });
      mockProvider.scheduleTierChange.mockResolvedValue({
        success: true,
        stripeSubscriptionScheduleId: 'sub_sched_existing',
        effectiveAt: new Date('2026-02-01'),
      });

      await service.subscribeToPlan('u1', SubscriptionTier.BASIC);

      expect(mockProvider.scheduleTierChange).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_m',
        stripeSubscriptionScheduleId: 'sub_sched_existing',
        tier: SubscriptionTier.BASIC,
      });
    });

    it('returns the failure when scheduling the paid<->paid change fails', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.MEDIUM,
        stripeSubscriptionId: 'sub_m',
      });
      mockProvider.scheduleTierChange.mockResolvedValue({
        success: false,
        reason: 'subscription_schedule_failed',
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.BASIC,
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe('subscription_schedule_failed');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('falls back to a local tier change without a stripe subscription', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.PREMIUM,
        stripeSubscriptionId: null,
      });

      const result = await service.subscribeToPlan('u1', SubscriptionTier.FREE);

      expect(result.success).toBe(true);
      expect(mockProvider.cancelSubscription).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            subscriptionTier: SubscriptionTier.FREE,
            cancelAtPeriodEnd: true,
          }) as never,
        }) as never,
      );
      expect(mockTokenStore.rewriteFieldsForUser).toHaveBeenCalledWith('u1', {
        tier: SubscriptionTier.FREE,
      });
    });

    it('applies a paid<->paid change immediately when there is no real stripe subscription', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.PREMIUM,
        stripeSubscriptionId: null,
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.BASIC,
      );

      expect(result.success).toBe(true);
      expect(mockProvider.scheduleTierChange).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subscriptionTier: SubscriptionTier.BASIC,
          }) as never,
        }) as never,
      );
      expect(mockTokenStore.rewriteFieldsForUser).toHaveBeenCalledWith('u1', {
        tier: SubscriptionTier.BASIC,
      });
    });

    it('skips scheduling a duplicate change already reconciled onto the target tier', async () => {
      mockPrisma.user.findUniqueOrThrow
        .mockResolvedValueOnce({
          ...SUB_USER,
          subscriptionTier: SubscriptionTier.MEDIUM,
          stripeSubscriptionId: 'sub_m',
        })
        .mockResolvedValueOnce({
          ...SUB_USER,
          subscriptionTier: SubscriptionTier.BASIC,
          stripeSubscriptionId: 'sub_m',
          subscriptionPeriodEnd: new Date('2026-02-01'),
        });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.BASIC,
      );

      expect(result.success).toBe(true);
      expect(result.periodEnd).toEqual(new Date('2026-02-01'));
      expect(mockProvider.scheduleTierChange).not.toHaveBeenCalled();
    });

    it('throws if already on the target tier', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        ...SUB_USER,
        subscriptionTier: SubscriptionTier.BASIC,
      });

      await expect(
        service.subscribeToPlan('u1', SubscriptionTier.BASIC),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelSubscription', () => {
    it('schedules cancellation at period end', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        stripeSubscriptionId: 'sub_x',
        subscriptionTier: SubscriptionTier.PREMIUM,
      });

      await service.cancelSubscription('u1');

      expect(mockProvider.cancelSubscription).toHaveBeenCalledWith('sub_x');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { cancelAtPeriodEnd: true },
      });
    });

    it('propagates provider failures instead of swallowing them', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        stripeSubscriptionId: 'sub_x',
        subscriptionTier: SubscriptionTier.PREMIUM,
      });
      mockProvider.cancelSubscription.mockRejectedValue(
        new Error('stripe down'),
      );

      await expect(service.cancelSubscription('u1')).rejects.toThrow(
        'stripe down',
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('marks cancelAtPeriodEnd without a stripe subscription', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        stripeSubscriptionId: null,
        subscriptionTier: SubscriptionTier.PREMIUM,
      });

      await service.cancelSubscription('u1');

      expect(mockProvider.cancelSubscription).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { cancelAtPeriodEnd: true },
      });
    });
  });

  describe('getBillingHistory', () => {
    it('returns transactions for the user', async () => {
      mockPrisma.walletTransaction.findMany.mockResolvedValue([
        {
          id: 't1',
          type: 'FEE',
          status: 'COMPLETED',
          reference: 'subscription:PREMIUM',
        },
      ]);

      const result = await service.getBillingHistory('u1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.walletTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'FEE',
            OR: [
              { fromWallet: { userId: 'u1' } },
              { toWallet: { userId: 'u1' } },
            ],
          }) as never,
        }) as never,
      );
    });
  });
});
