import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagingRoomService } from './messaging-room.service';

interface MockPrisma {
  room: { upsert: jest.Mock; findMany: jest.Mock };
  roomMessage: { create: jest.Mock; findMany: jest.Mock };
  pendingUpload: { findMany: jest.Mock; updateMany: jest.Mock };
  $transaction: jest.Mock;
}

function mockPrisma(): MockPrisma {
  const prisma = {} as MockPrisma;
  Object.assign(prisma, {
    // Constructor fire-and-forget seeding (seedRoomsWithRetry) — resolved
    // immediately so it never falls into its retry/backoff path during tests.
    room: {
      upsert: jest.fn().mockResolvedValue(undefined),
      findMany: jest.fn().mockResolvedValue([]),
    },
    roomMessage: { create: jest.fn(), findMany: jest.fn() },
    pendingUpload: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    // Interactive $transaction: run the callback with `tx` === this same
    // mock, matching this repo's established Prisma-mock convention (see
    // messaging-dm.service.spec.ts / comment.service.spec.ts).
    $transaction: jest.fn((cb: (tx: MockPrisma) => unknown) => cb(prisma)),
  });
  return prisma;
}

describe('MessagingRoomService', () => {
  let service: MessagingRoomService;
  let prisma: MockPrisma;
  let mockStorageCrypto: {
    flattenEnvelope: jest.Mock;
    encryptForRoom: jest.Mock;
    toWireAttachment: jest.Mock;
  };
  let mockUsage: { assertCanSendMessage: jest.Mock };

  beforeEach(() => {
    prisma = mockPrisma();
    mockStorageCrypto = {
      flattenEnvelope: jest.fn().mockReturnValue(null),
      encryptForRoom: jest
        .fn()
        .mockReturnValue({ v: 'storage-v1', nonce: 'n1', ct: 'c1' }),
      toWireAttachment: jest.fn((a: unknown) => a),
    };
    mockUsage = {
      assertCanSendMessage: jest.fn().mockResolvedValue(undefined),
    };

    service = new MessagingRoomService(
      prisma as never,
      null,
      mockStorageCrypto as never,
      mockUsage as never,
    );
  });

  describe('saveRoomMessage', () => {
    it('rejects an unknown room', async () => {
      await expect(
        service.saveRoomMessage('not-a-room', 'u1', 'FREE', 'hi'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects a FREE-tier sender from a VIP room', async () => {
      await expect(
        service.saveRoomMessage('vip-lounge', 'u1', 'FREE', 'hi'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates the message and relinks its PendingUpload rows inside the same transaction — regression: these were two separate top-level writes (create, then a trailing .then() doing the relink), so a crash/transient error between them left the message saved and visible to the sender while every OTHER room member got a 404 trying to view the attachment (assertCanAccessUpload only lets the uploader through when roomMessageId is still null)', async () => {
      prisma.roomMessage.create.mockResolvedValue({
        id: 'rm1',
        roomId: 'general',
        senderId: 'u1',
        sender: { name: 'Alice', email: 'a@a.com' },
        attachments: [],
      });
      prisma.pendingUpload.findMany.mockResolvedValue([
        {
          objectName: 'file-1.png',
          url: 'https://minio/uploads/file-1.png',
          v: 'storage-v1',
          nonce: 'n1',
          ct: 'c1',
          uploadedBy: 'u1',
          kind: 'CHAT_ROOM',
          scopeId: 'general',
          createdAt: new Date(),
        },
      ]);

      await service.saveRoomMessage('general', 'u1', 'FREE', 'hi', [
        {
          url: 'https://minio/uploads/file-1.png',
          type: 'image/png',
          name: 'file-1.png',
        },
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.pendingUpload.updateMany).toHaveBeenCalledWith({
        where: { url: { in: ['https://minio/uploads/file-1.png'] } },
        data: { roomMessageId: 'rm1' },
      });
      // The create must run (and the id it produces be used) inside the same
      // transaction call, not a bare top-level create racing the relink.
      expect(
        prisma.roomMessage.create.mock.invocationCallOrder[0],
      ).toBeLessThan(
        prisma.pendingUpload.updateMany.mock.invocationCallOrder[0],
      );
    });

    it('does not touch PendingUpload when the message carries no attachments', async () => {
      prisma.roomMessage.create.mockResolvedValue({
        id: 'rm2',
        roomId: 'general',
        senderId: 'u1',
        sender: { name: 'Alice', email: 'a@a.com' },
        attachments: [],
      });

      await service.saveRoomMessage('general', 'u1', 'FREE', 'hi');

      expect(prisma.pendingUpload.updateMany).not.toHaveBeenCalled();
    });
  });
});
