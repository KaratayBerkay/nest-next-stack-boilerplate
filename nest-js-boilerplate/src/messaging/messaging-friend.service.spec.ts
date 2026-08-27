import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagingFriendService } from './messaging-friend.service';

interface MockPrisma {
  friendship: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  user: { findUnique: jest.Mock; findMany: jest.Mock; count: jest.Mock };
  $executeRaw: jest.Mock;
  $transaction: jest.Mock;
}

function mockPrisma(): MockPrisma {
  const prisma = {} as MockPrisma;
  Object.assign(prisma, {
    friendship: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    $executeRaw: jest.fn().mockResolvedValue(undefined),
    // Interactive $transaction: run the callback with `tx` === this same
    // mock, matching this repo's established Prisma-mock convention (see
    // reactions.service.spec.ts / comment.service.spec.ts).
    $transaction: jest.fn((cb: (tx: MockPrisma) => unknown) => cb(prisma)),
  });
  return prisma;
}

describe('MessagingFriendService', () => {
  let service: MessagingFriendService;
  let prisma: MockPrisma;
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let mockFriends: { getFriendIds: jest.Mock; areFriends: jest.Mock };
  let mockTokenStore: { rewriteFieldsForUser: jest.Mock };
  let mockNotifications: { create: jest.Mock };

  beforeEach(() => {
    prisma = mockPrisma();
    mockCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    mockFriends = {
      getFriendIds: jest.fn().mockResolvedValue([]),
      areFriends: jest.fn(),
    };
    mockTokenStore = {
      rewriteFieldsForUser: jest.fn().mockResolvedValue(undefined),
    };
    mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };

    service = new MessagingFriendService(
      prisma as never,
      mockCache as never,
      mockFriends as never,
      mockTokenStore as never,
      mockNotifications as never,
    );
  });

  describe('sendFriendRequest', () => {
    it('rejects friending yourself', async () => {
      await expect(service.sendFriendRequest('u1', 'u1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('takes the pair-scoped advisory lock before checking for an existing relationship — regression: the findFirst-then-create/update was a TOCTOU race where two concurrent calls for the same (requesterId, addresseeId) could both see no existing row and both attempt create(), and the loser hit a raw 500 from the @@unique constraint instead of a friendly conflict', async () => {
      prisma.friendship.findFirst.mockResolvedValue(null);
      prisma.friendship.create.mockResolvedValue({ id: 'f1' });
      prisma.user.findUnique.mockResolvedValue({
        name: 'Bob',
        email: 'b@b.com',
      });

      await service.sendFriendRequest('u1', 'u2');

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.friendship.create).toHaveBeenCalledWith({
        data: { requesterId: 'u1', addresseeId: 'u2', status: 'PENDING' },
      });
      expect(
        prisma.friendship.create.mock.invocationCallOrder[0],
      ).toBeGreaterThan(
        prisma.friendship.findFirst.mock.invocationCallOrder[0],
      );
    });

    it('rejects a duplicate request in the same direction', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'f1',
        requesterId: 'u1',
        addresseeId: 'u2',
        status: 'PENDING',
      });

      await expect(service.sendFriendRequest('u1', 'u2')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.friendship.update).not.toHaveBeenCalled();
    });

    it('auto-accepts when the other side already sent a pending request (mutual/crossed requests)', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'f1',
        requesterId: 'u2',
        addresseeId: 'u1',
        status: 'PENDING',
      });
      prisma.user.findUnique.mockResolvedValue({
        name: 'Bob',
        email: 'b@b.com',
      });

      const result = await service.sendFriendRequest('u1', 'u2');

      expect(result).toEqual({ success: true });
      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: { status: 'ACCEPTED' },
      });
      expect(mockCache.del).toHaveBeenCalledWith('friends:u1:');
    });

    it('re-requesting after a decline in the SAME direction revives the row as PENDING with that direction', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'f1',
        requesterId: 'u1',
        addresseeId: 'u2',
        status: 'DECLINED',
      });
      prisma.user.findUnique.mockResolvedValue({
        name: 'Bob',
        email: 'b@b.com',
      });

      await service.sendFriendRequest('u1', 'u2');

      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: { status: 'PENDING', requesterId: 'u1', addresseeId: 'u2' },
      });
    });

    // Regression: reviving a DECLINED row with only a status flip kept the
    // OLD direction. When the previously-declined addressee was the one now
    // asking (u1 asked u2, u2 declined, u2 now asks u1), the row stayed
    // requester=u1/addressee=u2 — u1 saw a phantom OUTGOING request they
    // never sent, and could never accept the real one (acceptFriendRequest
    // looks the row up by the current direction and 404s).
    it('re-requesting after a decline in the REVERSED direction rewrites requester/addressee to the new asker', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'f1',
        requesterId: 'u1',
        addresseeId: 'u2',
        status: 'DECLINED',
      });
      prisma.user.findUnique.mockResolvedValue({
        name: 'Ann',
        email: 'a@a.com',
      });

      await service.sendFriendRequest('u2', 'u1');

      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: { status: 'PENDING', requesterId: 'u2', addresseeId: 'u1' },
      });
    });

    it('rejects sending a request to someone who blocked you', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'f1',
        requesterId: 'u2',
        addresseeId: 'u1',
        status: 'BLOCKED',
      });

      await expect(service.sendFriendRequest('u1', 'u2')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejects when already friends', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'f1',
        requesterId: 'u1',
        addresseeId: 'u2',
        status: 'ACCEPTED',
      });

      await expect(service.sendFriendRequest('u1', 'u2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('acceptFriendRequest', () => {
    it('accepts a pending request inside the pair-scoped advisory lock, and accepts a mirrored reverse request too', async () => {
      prisma.friendship.findUnique
        .mockResolvedValueOnce({ id: 'f1', status: 'PENDING' })
        .mockResolvedValueOnce({ id: 'f2', status: 'PENDING' });
      prisma.user.findUnique.mockResolvedValue({
        name: 'Bob',
        email: 'b@b.com',
      });

      await service.acceptFriendRequest('u1', 'u2');

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: { status: 'ACCEPTED' },
      });
      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f2' },
        data: { status: 'ACCEPTED' },
      });
    });

    it('throws when no matching request exists', async () => {
      prisma.friendship.findUnique.mockResolvedValue(null);

      await expect(service.acceptFriendRequest('u1', 'u2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws when the request is not pending', async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: 'f1',
        status: 'DECLINED',
      });

      await expect(service.acceptFriendRequest('u1', 'u2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('declineFriendRequest', () => {
    it('declines a pending request and any mirrored reverse request', async () => {
      prisma.friendship.findUnique
        .mockResolvedValueOnce({ id: 'f1', status: 'PENDING' })
        .mockResolvedValueOnce({ id: 'f2', status: 'PENDING' });

      const result = await service.declineFriendRequest('u1', 'u2');

      expect(result).toEqual({ success: true });
      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: { status: 'DECLINED' },
      });
      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f2' },
        data: { status: 'DECLINED' },
      });
    });

    it('throws when no matching request exists', async () => {
      prisma.friendship.findUnique.mockResolvedValue(null);

      await expect(service.declineFriendRequest('u1', 'u2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUsersCount', () => {
    it('returns the true match count from prisma.user.count, not a count capped at getUsers own 50-row take', async () => {
      prisma.user.count.mockResolvedValue(137);

      const result = await service.getUsersCount('u1', 'ali');

      expect(result).toBe(137);
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          status: { in: ['ACTIVE', 'PENDING_VERIFICATION'] },
          id: { notIn: ['u1'] },
          OR: [
            { name: { contains: 'ali', mode: 'insensitive' } },
            { email: { contains: 'ali', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('excludes users with any existing friendship from the count, same as getUsers', async () => {
      prisma.friendship.findMany.mockResolvedValue([
        { requesterId: 'u1', addresseeId: 'u2' },
        { requesterId: 'u3', addresseeId: 'u1' },
      ]);
      prisma.user.count.mockResolvedValue(5);

      await service.getUsersCount('u1');

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          status: { in: ['ACTIVE', 'PENDING_VERIFICATION'] },
          id: { notIn: ['u1', 'u2', 'u3'] },
        },
      });
    });
  });
});
