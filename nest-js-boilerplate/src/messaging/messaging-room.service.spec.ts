import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagingRoomService } from './messaging-room.service';

interface MockPrisma {
  room: { upsert: jest.Mock; findMany: jest.Mock };
  roomMessage: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  roomMessageDeletion: { upsert: jest.Mock };
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
    roomMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    roomMessageDeletion: { upsert: jest.fn().mockResolvedValue(undefined) },
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
  let mockRealtime: {
    emitToUserEncrypted: jest.Mock;
    emitToRoomEncrypted: jest.Mock;
  };

  beforeEach(() => {
    prisma = mockPrisma();
    mockStorageCrypto = {
      flattenEnvelope: jest.fn().mockReturnValue(null),
      encryptForRoom: jest
        .fn()
        .mockReturnValue({ v: 'storage-v1', nonce: 'n1', ct: 'c1' }),
      toWireAttachment: jest.fn((a: unknown) => a),
      toEnvelope: jest.fn((m: { v: string; ct: string; nonce: string }) => ({
        v: m.v,
        ct: m.ct,
        nonce: m.nonce,
      })),
      decryptForRoom: jest.fn().mockReturnValue({ text: 'quoted' }),
    };
    mockRealtime = {
      emitToUserEncrypted: jest.fn().mockResolvedValue(undefined),
      emitToRoomEncrypted: jest.fn().mockResolvedValue(undefined),
    };
    mockUsage = {
      assertCanSendMessage: jest.fn().mockResolvedValue(undefined),
    };

    service = new MessagingRoomService(
      prisma as never,
      null,
      mockStorageCrypto as never,
      mockUsage as never,
      mockRealtime as never,
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

  // CROSS-024: chat rooms gained reply-to + delete (for me / for everyone),
  // mirroring the DM contract in messaging-dm.service.ts.
  describe('reply-to (CROSS-024)', () => {
    const savedRow = (replyTo: unknown) => ({
      id: 'rm-2',
      roomId: 'general',
      senderId: 'u1',
      createdAt: new Date('2026-09-03T10:00:00Z'),
      attachments: [],
      sender: { name: 'A', email: 'a@x.io' },
      replyTo,
    });

    it('persists a replyToId that points at a message in the same room and returns its preview', async () => {
      prisma.roomMessage.findUnique.mockResolvedValue({
        id: 'rm-1',
        roomId: 'general',
      });
      prisma.roomMessage.create.mockResolvedValue(
        savedRow({
          id: 'rm-1',
          senderId: 'u2',
          v: 'storage-v1',
          ct: 'c0',
          nonce: 'n0',
          deletedAt: null,
          attachments: [],
          sender: { name: 'Bea', email: 'b@x.io' },
        }),
      );

      const result = await service.saveRoomMessage(
        'general',
        'u1',
        'FREE',
        'hi',
        [],
        undefined,
        'rm-1',
      );

      expect(prisma.roomMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ replyToId: 'rm-1' }),
          include: expect.objectContaining({
            replyTo: {
              include: expect.objectContaining({ attachments: true }),
            },
          }),
        }),
      );
      expect(result.replyTo).toMatchObject({
        id: 'rm-1',
        senderId: 'u2',
        senderName: 'Bea',
      });
    });

    it('rejects a replyToId from another room (no cross-room quoting)', async () => {
      prisma.roomMessage.findUnique.mockResolvedValue({
        id: 'rm-1',
        roomId: 'vip-lounge',
      });

      await expect(
        service.saveRoomMessage(
          'general',
          'u1',
          'FREE',
          'hi',
          [],
          undefined,
          'rm-1',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.roomMessage.create).not.toHaveBeenCalled();
    });

    it('rejects a replyToId that does not exist', async () => {
      prisma.roomMessage.findUnique.mockResolvedValue(null);
      await expect(
        service.saveRoomMessage(
          'general',
          'u1',
          'FREE',
          'hi',
          [],
          undefined,
          'missing',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('getRoomMessages tombstones + delete-for-me filter (CROSS-024)', () => {
    it('hides rows the viewer deleted-for-me and serves deleted-for-everyone rows as tombstones', async () => {
      prisma.roomMessage.findMany.mockResolvedValue([
        {
          id: 'rm-2',
          senderId: 'u1',
          sender: { name: 'A', email: 'a@x.io' },
          v: 'storage-v1',
          ct: 'c2',
          nonce: 'n2',
          attachments: [{ url: 'https://cdn/x.png' }],
          deletedAt: new Date('2026-09-03T10:05:00Z'),
          replyTo: null,
          createdAt: new Date('2026-09-03T10:00:00Z'),
        },
      ]);

      const result = await service.getRoomMessages(
        'general',
        'FREE',
        undefined,
        30,
        'viewer-1',
      );

      expect(prisma.roomMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletions: { none: { userId: 'viewer-1' } },
          }),
        }),
      );
      const [row] = result.messages as Array<Record<string, unknown>>;
      expect(row.deletedAt).toBe('2026-09-03T10:05:00.000Z');
      expect(row.body).toBeNull();
      expect(row).not.toHaveProperty('ct');
      expect(row.attachments).toEqual([]);
    });

    it('does not add the deletions filter when no viewer is given (internal callers)', async () => {
      prisma.roomMessage.findMany.mockResolvedValue([]);
      await service.getRoomMessages('general', 'FREE');
      const where = prisma.roomMessage.findMany.mock.calls[0][0].where;
      expect(where).not.toHaveProperty('deletions');
    });
  });

  describe('deleteRoomMessageForMe (CROSS-024)', () => {
    it('upserts a per-viewer deletion row and syncs only the actor', async () => {
      prisma.roomMessage.findFirst.mockResolvedValue({ id: 'rm-1' });

      const result = await service.deleteRoomMessageForMe(
        'u1',
        'general',
        'rm-1',
      );

      expect(result).toEqual({ id: 'rm-1' });
      expect(prisma.roomMessageDeletion.upsert).toHaveBeenCalledWith({
        where: { roomMessageId_userId: { roomMessageId: 'rm-1', userId: 'u1' } },
        create: { roomMessageId: 'rm-1', userId: 'u1' },
        update: {},
      });
      expect(mockRealtime.emitToUserEncrypted).toHaveBeenCalledWith('u1', {
        type: 'room-message-deleted',
        scope: 'me',
        room: 'general',
        messageId: 'rm-1',
      });
      expect(mockRealtime.emitToRoomEncrypted).not.toHaveBeenCalled();
    });

    it('404s when the message is not in that room', async () => {
      prisma.roomMessage.findFirst.mockResolvedValue(null);
      await expect(
        service.deleteRoomMessageForMe('u1', 'general', 'rm-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.roomMessageDeletion.upsert).not.toHaveBeenCalled();
    });
  });

  describe('deleteRoomMessageForEveryone (CROSS-024)', () => {
    const fresh = () => ({
      id: 'rm-1',
      senderId: 'u1',
      createdAt: new Date(Date.now() - 60_000),
      deletedAt: null,
    });

    it('tombstones the row and broadcasts one frame to the whole room', async () => {
      prisma.roomMessage.findFirst.mockResolvedValue(fresh());

      const result = await service.deleteRoomMessageForEveryone(
        'u1',
        'general',
        'rm-1',
      );

      expect(prisma.roomMessage.update).toHaveBeenCalledWith({
        where: { id: 'rm-1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(mockRealtime.emitToRoomEncrypted).toHaveBeenCalledWith(
        'general',
        expect.objectContaining({
          type: 'room-message-deleted',
          scope: 'everyone',
          room: 'general',
          messageId: 'rm-1',
          senderId: 'u1',
          deletedAt: result.deletedAt,
        }),
      );
    });

    it('is sender-only', async () => {
      prisma.roomMessage.findFirst.mockResolvedValue(fresh());
      await expect(
        service.deleteRoomMessageForEveryone('u2', 'general', 'rm-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.roomMessage.update).not.toHaveBeenCalled();
    });

    it('refuses once the delete window has passed', async () => {
      prisma.roomMessage.findFirst.mockResolvedValue({
        ...fresh(),
        createdAt: new Date(Date.now() - 16 * 60 * 1000),
      });
      await expect(
        service.deleteRoomMessageForEveryone('u1', 'general', 'rm-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('is idempotent on an already-tombstoned message', async () => {
      const deletedAt = new Date('2026-09-03T10:05:00Z');
      prisma.roomMessage.findFirst.mockResolvedValue({ ...fresh(), deletedAt });
      const result = await service.deleteRoomMessageForEveryone(
        'u1',
        'general',
        'rm-1',
      );
      expect(prisma.roomMessage.update).not.toHaveBeenCalled();
      expect(result.deletedAt).toBe(deletedAt.toISOString());
    });
  });
});
