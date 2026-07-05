import { BadRequestException } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { BillingService } from './billing.service';
import type { PaymentProvider } from './payment-provider.interface';

describe('BillingService', () => {
  let service: BillingService;
  let mockProvider: jest.Mocked<PaymentProvider>;
  let mockPrisma: any;
  let mockTokenStore: any;
  let mockNotification: any;
  let mockRealtime: any;

  beforeEach(() => {
    mockProvider = {
      charge: jest.fn(),
    };
    mockPrisma = {
      user: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      wallet: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'w1', userId: 'u1', currency: 'USD' }),
        create: jest.fn(),
      },
      walletTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    mockTokenStore = {
      rewriteFieldsForUser: jest.fn(),
    };
    mockNotification = {
      create: jest.fn(),
    };
    mockRealtime = {
      updateUserTier: jest.fn(),
    };

    service = new BillingService(
      mockPrisma,
      mockTokenStore,
      mockNotification,
      mockRealtime,
      mockProvider,
    );
  });

  describe('subscribeToPlan', () => {
    it('upgrades tier on approved card', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.FREE,
      });
      mockProvider.charge.mockResolvedValue({
        approved: true,
        providerRef: 'mock_abc',
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.PREMIUM,
        {
          last4: '4242',
          expMonth: 12,
          expYear: 2030,
        },
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { subscriptionTier: SubscriptionTier.PREMIUM },
      });
      expect(mockTokenStore.rewriteFieldsForUser).toHaveBeenCalledWith('u1', {
        tier: SubscriptionTier.PREMIUM,
      });
      expect(mockRealtime.updateUserTier).toHaveBeenCalledWith(
        'u1',
        SubscriptionTier.PREMIUM,
      );
      expect(mockPrisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'FEE',
            status: 'COMPLETED',
          }),
        }),
      );
      expect(mockNotification.create).toHaveBeenCalled();
    });

    it('rejects declined card without changing tier', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.FREE,
      });
      mockProvider.charge.mockResolvedValue({
        approved: false,
        reason: 'generic_decline',
        providerRef: 'mock_xyz',
      });

      const result = await service.subscribeToPlan(
        'u1',
        SubscriptionTier.BASIC,
        {
          last4: '0002',
          expMonth: 12,
          expYear: 2030,
        },
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe('generic_decline');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
      expect(mockPrisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'FEE',
            status: 'FAILED',
          }),
        }),
      );
      expect(mockNotification.create).not.toHaveBeenCalled();
    });

    it('downgrades without calling the payment provider', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.PREMIUM,
      });

      const result = await service.subscribeToPlan('u1', SubscriptionTier.FREE);

      expect(result.success).toBe(true);
      expect(mockProvider.charge).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { subscriptionTier: SubscriptionTier.FREE },
      });
      expect(mockRealtime.updateUserTier).toHaveBeenCalledWith(
        'u1',
        SubscriptionTier.FREE,
      );
      expect(mockPrisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'ADJUSTMENT',
            status: 'COMPLETED',
          }),
        }),
      );
      expect(mockNotification.create).toHaveBeenCalled();
    });

    it('throws if already on the target tier', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.BASIC,
      });

      await expect(
        service.subscribeToPlan('u1', SubscriptionTier.BASIC),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if upgrade requested without card', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        subscriptionTier: SubscriptionTier.FREE,
      });

      await expect(
        service.subscribeToPlan('u1', SubscriptionTier.PREMIUM),
      ).rejects.toThrow('Card information required for upgrades');
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
      expect(mockPrisma.walletTransaction.findMany).toHaveBeenCalled();
    });
  });
});
