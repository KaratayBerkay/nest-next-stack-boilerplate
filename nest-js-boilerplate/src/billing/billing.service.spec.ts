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
  };
  $transaction: jest.Mock;
};

interface MockPaymentProvider {
  createSubscription: jest.Mock;
  cancelSubscription: jest.Mock;
  chargeCredits?: jest.Mock;
  getSubscriptionStatus?: jest.Mock;
}

type MockTokenStore = { rewriteFieldsForUser: jest.Mock };
type MockNotification = { create: jest.Mock };
type MockRealtime = { updateUserTier: jest.Mock };
type MockStripeService = {
  createCustomer: jest.Mock;
  createSetupIntent: jest.Mock;
};
type MockWallet = { ensureWallet: jest.Mock };

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
    mockProvider = { createSubscription, cancelSubscription };

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
    const transaction = jest.fn((ops: unknown[]) => Promise.resolve(ops));
    mockPrisma = {
      user: { findUniqueOrThrow, findUnique, update },
      wallet: { findUnique: wFindUnique, create: wCreate },
      walletTransaction: {
        create: wtCreate,
        findMany: wtFindMany,
        findFirst: wtFindFirst,
      },
      $transaction: transaction,
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

    service = new BillingService(
      mockPrisma as never,
      mockTokenStore as never,
      mockNotification as never,
      mockRealtime as never,
      mockStripe as never,
      mockWallet as never,
      mockProvider,
    );
  });

  describe('subscribeToPlan', () => {
    it('upgrades tier on approved subscription', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.FREE,
        stripeCustomerId: 'cus_existing',
        email: 'user@example.com',
        name: 'Test',
      });
      mockProvider.createSubscription.mockResolvedValue({
        success: true,
        stripeSubscriptionId: 'sub_abc',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-02-01'),
        latestInvoiceId: 'inv_1',
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        'pm_card123',
      );

      expect(result.success).toBe(true);
      expect(mockProvider.createSubscription).toHaveBeenCalledWith({
        userId: 'u1',
        tier: SubscriptionTier.PREMIUM,
        paymentMethodId: 'pm_card123',
        stripeCustomerId: 'cus_existing',
      } satisfies Record<string, unknown>);
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
        subscriptionTier: SubscriptionTier.FREE,
        stripeCustomerId: null,
        email: 'user@example.com',
        name: 'Test',
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
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.FREE,
        stripeCustomerId: 'cus_existing',
        email: 'user@example.com',
        name: 'Test',
      });
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

    it('downgrades without calling the payment provider', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.PREMIUM,
        stripeCustomerId: 'cus_existing',
        email: 'user@example.com',
        name: 'Test',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        stripeSubscriptionId: 'sub_prem',
      });

      const result = await service.subscribeToPlan('u1', SubscriptionTier.FREE);

      expect(result.success).toBe(true);
      expect(mockProvider.createSubscription).not.toHaveBeenCalled();
      expect(mockProvider.cancelSubscription).toHaveBeenCalledWith('sub_prem');
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

    it('throws if already on the target tier', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.BASIC,
        stripeCustomerId: 'cus_existing',
        email: 'user@example.com',
        name: 'Test',
      });

      await expect(
        service.subscribeToPlan('u1', SubscriptionTier.BASIC),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if upgrade requested without paymentMethodId', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.FREE,
        stripeCustomerId: 'cus_existing',
        email: 'user@example.com',
        name: 'Test',
      });

      await expect(
        service.subscribeToPlan('u1', SubscriptionTier.PREMIUM),
      ).rejects.toThrow('paymentMethodId required for upgrades');
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
