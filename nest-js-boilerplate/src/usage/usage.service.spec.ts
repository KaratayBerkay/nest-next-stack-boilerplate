import { ForbiddenException } from '@nestjs/common';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { UsageService } from './usage.service';
import { FREE_UPLOAD_STORAGE_BYTES } from './usage.constants';

function mockPrisma() {
  return {
    pendingUpload: { aggregate: jest.fn() },
  };
}

describe('UsageService', () => {
  describe('getUploadStorageUsage', () => {
    it('sums bytes/file count for the user and applies the tier storage multiplier', async () => {
      const prisma = mockPrisma();
      prisma.pendingUpload.aggregate.mockResolvedValue({
        _sum: { size: 500 },
        _count: { _all: 3 },
      });
      const service = new UsageService(prisma as never);

      const result = await service.getUploadStorageUsage(
        'u1',
        SubscriptionTier.FREE,
      );

      expect(result).toEqual({
        bytes: 500,
        fileCount: 3,
        limitBytes: FREE_UPLOAD_STORAGE_BYTES,
        tier: SubscriptionTier.FREE,
        multiplier: 1,
      });
      expect(prisma.pendingUpload.aggregate).toHaveBeenCalledWith({
        _sum: { size: true },
        _count: { _all: true },
        where: { uploadedBy: 'u1' },
      });
    });

    it('returns zero usage for a user with no uploads yet (null aggregate sum)', async () => {
      const prisma = mockPrisma();
      prisma.pendingUpload.aggregate.mockResolvedValue({
        _sum: { size: null },
        _count: { _all: 0 },
      });
      const service = new UsageService(prisma as never);

      const result = await service.getUploadStorageUsage(
        'u1',
        SubscriptionTier.FREE,
      );

      expect(result.bytes).toBe(0);
    });

    it("queries through the given transaction client instead of the default prisma instance — required for the advisory-lock-guarded re-check in upload.controller.ts to see the same connection's in-progress work", async () => {
      const prisma = mockPrisma();
      const tx = { pendingUpload: { aggregate: jest.fn() } };
      tx.pendingUpload.aggregate.mockResolvedValue({
        _sum: { size: 100 },
        _count: { _all: 1 },
      });
      const service = new UsageService(prisma as never);

      await service.getUploadStorageUsage(
        'u1',
        SubscriptionTier.FREE,
        tx as never,
      );

      expect(tx.pendingUpload.aggregate).toHaveBeenCalled();
      expect(prisma.pendingUpload.aggregate).not.toHaveBeenCalled();
    });
  });

  describe('assertCanUploadBytes', () => {
    it('resolves when the projected usage stays within the limit', async () => {
      const prisma = mockPrisma();
      prisma.pendingUpload.aggregate.mockResolvedValue({
        _sum: { size: 100 },
        _count: { _all: 1 },
      });
      const service = new UsageService(prisma as never);

      await expect(
        service.assertCanUploadBytes('u1', 50, SubscriptionTier.FREE),
      ).resolves.toBeUndefined();
    });

    it('throws ForbiddenException when the projected usage would exceed the limit', async () => {
      const prisma = mockPrisma();
      prisma.pendingUpload.aggregate.mockResolvedValue({
        _sum: { size: FREE_UPLOAD_STORAGE_BYTES },
        _count: { _all: 1 },
      });
      const service = new UsageService(prisma as never);

      await expect(
        service.assertCanUploadBytes('u1', 1, SubscriptionTier.FREE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('forwards the transaction client through to the usage lookup', async () => {
      const prisma = mockPrisma();
      const tx = { pendingUpload: { aggregate: jest.fn() } };
      tx.pendingUpload.aggregate.mockResolvedValue({
        _sum: { size: 0 },
        _count: { _all: 0 },
      });
      const service = new UsageService(prisma as never);

      await service.assertCanUploadBytes(
        'u1',
        10,
        SubscriptionTier.FREE,
        tx as never,
      );

      expect(tx.pendingUpload.aggregate).toHaveBeenCalled();
      expect(prisma.pendingUpload.aggregate).not.toHaveBeenCalled();
    });
  });
});
