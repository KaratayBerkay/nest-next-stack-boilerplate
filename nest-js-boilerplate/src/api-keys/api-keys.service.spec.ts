import { ConflictException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

function buildService() {
  const apiKey = {
    findFirst: jest.fn(),
    create: jest.fn(),
  };
  const executeRaw = jest.fn().mockResolvedValue(undefined);

  const prisma: Record<string, unknown> = { apiKey };
  // Interactive $transaction: run the callback with a `tx` that shares the
  // same mock methods, matching this repo's established Prisma-mock
  // convention (see reactions.service.spec.ts / comment.service.spec.ts).
  prisma.$transaction = jest.fn((cb: (tx: unknown) => unknown) =>
    cb({ ...prisma, $executeRaw: executeRaw }),
  );

  const service = new ApiKeysService(prisma as never);

  return { service, prisma, apiKey, executeRaw };
}

describe('ApiKeysService.generate', () => {
  it('takes the advisory lock and checks for a name collision inside the same transaction as the create — regression for a TOCTOU race where two concurrent calls could both pass the findFirst check (no DB constraint backs the (userId, name) uniqueness) and both create a key with the same name', async () => {
    const { service, apiKey, executeRaw } = buildService();
    apiKey.findFirst.mockResolvedValue(null);
    apiKey.create.mockResolvedValue({
      id: 'k1',
      name: 'ci',
      keyPrefix: 'bp_abcd1234',
      createdAt: new Date(),
      lastUsedAt: null,
      expiresAt: null,
      enabled: true,
      role: 'USER',
      tier: 'FREE',
    });

    await service.generate('user1', 'ci');

    expect(executeRaw).toHaveBeenCalled();
    expect(apiKey.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user1', name: 'ci', deletedAt: null },
    });
    // The lock, the check, and the create must all be inside the one
    // transaction — not the create racing ahead as a separate top-level call.
    expect(apiKey.create.mock.invocationCallOrder[0]).toBeGreaterThan(
      apiKey.findFirst.mock.invocationCallOrder[0],
    );
  });

  it('rejects a duplicate name without creating a second key', async () => {
    const { service, apiKey } = buildService();
    apiKey.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(service.generate('user1', 'ci')).rejects.toThrow(
      ConflictException,
    );
    expect(apiKey.create).not.toHaveBeenCalled();
  });
});
