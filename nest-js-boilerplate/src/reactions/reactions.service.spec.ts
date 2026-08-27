import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReactionsService } from './reactions.service';

interface MockPrisma {
  reaction: {
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  post: { findUnique: jest.Mock };
  comment: { findUnique: jest.Mock };
  $executeRaw: jest.Mock;
  $transaction: jest.Mock;
}

function mockPrisma(): MockPrisma {
  const prisma = {} as MockPrisma;
  Object.assign(prisma, {
    reaction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: { findUnique: jest.fn() },
    comment: { findUnique: jest.fn() },
    $executeRaw: jest.fn().mockResolvedValue(undefined),
    // Interactive $transaction: run the callback with `tx` === this same
    // mock, matching this repo's established Prisma-mock convention (see
    // comment.service.spec.ts / billing.service.spec.ts).
    $transaction: jest.fn((cb: (tx: MockPrisma) => unknown) => cb(prisma)),
  });
  return prisma;
}

describe('ReactionsService', () => {
  let service: ReactionsService;
  let prisma: MockPrisma;
  let mockNotifications: { create: jest.Mock };
  let mockRealtime: { emitToTopic: jest.Mock };
  let mockCache: { invalidate: jest.Mock };

  beforeEach(() => {
    prisma = mockPrisma();
    prisma.post.findUnique.mockResolvedValue({ deletedAt: null });
    prisma.comment.findUnique.mockResolvedValue({ deletedAt: null });
    mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };
    mockRealtime = { emitToTopic: jest.fn().mockReturnValue(0) };
    mockCache = { invalidate: jest.fn().mockResolvedValue(undefined) };
    service = new ReactionsService(
      prisma as never,
      mockNotifications as never,
      mockRealtime as never,
      mockCache as never,
    );
  });

  describe('create', () => {
    it('rejects reacting to a soft-deleted post — regression: Prisma `connect` only fails on a genuinely missing row (P2025), so reacting to a soft-deleted post previously succeeded silently, notifying its (still-real) author and resurfacing the reaction if the post were ever undeleted', async () => {
      prisma.post.findUnique.mockResolvedValue({ deletedAt: new Date() });

      await expect(
        service.create('u1', { postId: 'p1', type: 'LIKE' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects reacting to a nonexistent post', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.create('u1', { postId: 'p1', type: 'LIKE' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects reacting to a soft-deleted comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ deletedAt: new Date() });

      await expect(
        service.create('u1', { commentId: 'c1', type: 'LIKE' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates a new reaction, notifies the target author, and invalidates the post cache', async () => {
      prisma.reaction.findFirst.mockResolvedValue(null);
      prisma.reaction.create.mockResolvedValue({
        id: 'r1',
        userId: 'u1',
        type: 'LIKE',
        postId: 'p1',
        commentId: null,
        post: { authorId: 'author1', title: 'My Post' },
      });

      const result = await service.create('u1', { postId: 'p1', type: 'LIKE' });

      expect(result).toMatchObject({ id: 'r1' });
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'author1', actorId: 'u1' }),
      );
      expect(mockCache.invalidate).toHaveBeenCalledWith('cache:post:p1');
    });

    it('does not notify when reacting to your own post', async () => {
      prisma.reaction.findFirst.mockResolvedValue(null);
      prisma.reaction.create.mockResolvedValue({
        id: 'r1',
        userId: 'u1',
        type: 'LIKE',
        postId: 'p1',
        commentId: null,
        post: { authorId: 'u1', title: 'My Post' },
      });

      await service.create('u1', { postId: 'p1', type: 'LIKE' });

      expect(mockNotifications.create).not.toHaveBeenCalled();
    });

    it('toggles an identical reaction off (delete) instead of erroring', async () => {
      prisma.reaction.findFirst.mockResolvedValue({
        id: 'r1',
        type: 'LIKE',
      });
      prisma.reaction.delete.mockResolvedValue({
        id: 'r1',
        userId: 'u1',
        type: 'LIKE',
        postId: 'p1',
        commentId: null,
        post: { authorId: 'author1', title: 'My Post' },
      });

      const result = await service.create('u1', { postId: 'p1', type: 'LIKE' });

      expect(result).toMatchObject({ id: 'r1', deleted: true });
      expect(prisma.reaction.create).not.toHaveBeenCalled();
      // Deleting a reaction is not a new creation — must not notify.
      expect(mockNotifications.create).not.toHaveBeenCalled();
    });

    it('switches an existing reaction to a different type (update) instead of creating a duplicate', async () => {
      prisma.reaction.findFirst.mockResolvedValue({ id: 'r1', type: 'LIKE' });
      prisma.reaction.update.mockResolvedValue({
        id: 'r1',
        userId: 'u1',
        type: 'LOVE',
        postId: 'p1',
        commentId: null,
        post: { authorId: 'author1', title: 'My Post' },
      });

      const result = await service.create('u1', { postId: 'p1', type: 'LOVE' });

      expect(result).toMatchObject({ id: 'r1', type: 'LOVE' });
      expect(prisma.reaction.create).not.toHaveBeenCalled();
      expect(prisma.reaction.delete).not.toHaveBeenCalled();
    });

    it('resolves the cache/realtime target post from the comment relation for a comment reaction — regression: previously fell back to `data.postId`, which is always undefined for a comment reaction, so cache invalidation and realtime fan-out silently never fired', async () => {
      prisma.reaction.findFirst.mockResolvedValue(null);
      prisma.reaction.create.mockResolvedValue({
        id: 'r1',
        userId: 'u1',
        type: 'LIKE',
        postId: null,
        commentId: 'c1',
        comment: { authorId: 'author1', postId: 'p9' },
      });

      await service.create('u1', { commentId: 'c1', type: 'LIKE' });

      expect(mockCache.invalidate).toHaveBeenCalledWith('cache:post:p9');
      expect(mockRealtime.emitToTopic).toHaveBeenCalledWith(
        'post:p9',
        expect.objectContaining({ id: 'p9' }),
      );
    });

    it('maps a lost create race to a friendly conflict instead of a raw 500 — two concurrent creates for the same (userId, postId) both pass the advisory-lock-serialized findFirst as null only if they ran in different transactions; the DB @@unique constraint is the real backstop', async () => {
      prisma.reaction.findFirst.mockResolvedValue(null);
      prisma.reaction.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      await expect(
        service.create('u1', { postId: 'p1', type: 'LIKE' }),
      ).rejects.toThrow(ConflictException);
    });

    it('does not let a notification failure fail the mutation — the reaction already committed', async () => {
      prisma.reaction.findFirst.mockResolvedValue(null);
      prisma.reaction.create.mockResolvedValue({
        id: 'r1',
        userId: 'u1',
        type: 'LIKE',
        postId: 'p1',
        commentId: null,
        post: { authorId: 'author1', title: 'My Post' },
      });
      mockNotifications.create.mockRejectedValue(new Error('notif down'));

      await expect(
        service.create('u1', { postId: 'p1', type: 'LIKE' }),
      ).resolves.toMatchObject({ id: 'r1' });
    });
  });

  describe('findByTarget', () => {
    it('requires at least one of postId/commentId', () => {
      expect(() => service.findByTarget()).toThrow(ConflictException);
    });
  });
});
