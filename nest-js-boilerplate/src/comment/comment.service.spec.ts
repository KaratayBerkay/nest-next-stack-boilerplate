import { NotFoundException } from '@nestjs/common';
import { CommentService } from './comment.service';

interface MockPrisma {
  comment: {
    findFirst: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    findMany: jest.Mock;
  };
  post: { findUnique: jest.Mock };
}

function mockPrisma(): MockPrisma {
  return {
    comment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    post: { findUnique: jest.fn() },
  };
}

describe('CommentService', () => {
  let service: CommentService;
  let prisma: MockPrisma;
  let mockNotifications: { create: jest.Mock };
  let mockRealtime: { emitToTopic: jest.Mock };
  let mockCache: { invalidate: jest.Mock };

  beforeEach(() => {
    prisma = mockPrisma();
    mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };
    mockRealtime = { emitToTopic: jest.fn().mockReturnValue(0) };
    mockCache = { invalidate: jest.fn().mockResolvedValue(undefined) };
    service = new CommentService(
      prisma as never,
      mockNotifications as never,
      mockRealtime as never,
      mockCache as never,
    );
  });

  describe('create', () => {
    it('creates a top-level comment, notifies the post author, and fans out over realtime', async () => {
      prisma.comment.create.mockResolvedValue({
        id: 'c1',
        body: 'Nice post!',
        postId: 'p1',
        authorId: 'u1',
      });
      prisma.post.findUnique.mockResolvedValue({
        authorId: 'post-author',
        title: 'My Post',
      });

      const result = await service.create('u1', {
        postId: 'p1',
        body: 'Nice post!',
      });

      expect(result.id).toBe('c1');
      expect(prisma.comment.findFirst).not.toHaveBeenCalled(); // no parentId -> no duplicate-reply check
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          body: 'Nice post!',
          imageUrl: undefined,
          author: { connect: { id: 'u1' } },
          post: { connect: { id: 'p1' } },
        },
        include: {
          author: true,
          post: { select: { authorId: true, title: true } },
        },
      });
      expect(mockNotifications.create).toHaveBeenCalledWith({
        userId: 'post-author',
        actorId: 'u1',
        type: 'COMMENT',
        title: 'New comment on your post',
        body: 'Nice post!',
        payload: { postId: 'p1', commentId: 'c1' },
      });
      expect(mockRealtime.emitToTopic).toHaveBeenCalledWith(
        'feed',
        expect.objectContaining({ type: 'Post', id: 'p1' }),
      );
      expect(mockRealtime.emitToTopic).toHaveBeenCalledWith(
        'post:p1',
        expect.objectContaining({ type: 'Post', id: 'p1' }),
      );
    });

    it('does not notify when the author comments on their own post', async () => {
      prisma.comment.create.mockResolvedValue({
        id: 'c1',
        body: 'Self comment',
        postId: 'p1',
        authorId: 'u1',
      });
      prisma.post.findUnique.mockResolvedValue({
        authorId: 'u1',
        title: 'My Post',
      });

      await service.create('u1', { postId: 'p1', body: 'Self comment' });

      expect(mockNotifications.create).not.toHaveBeenCalled();
    });

    it('truncates long comment bodies to 100 chars (+ ellipsis) in the notification', async () => {
      const longBody = 'x'.repeat(150);
      prisma.comment.create.mockResolvedValue({
        id: 'c1',
        body: longBody,
        postId: 'p1',
        authorId: 'u1',
      });
      prisma.post.findUnique.mockResolvedValue({
        authorId: 'post-author',
        title: 'My Post',
      });

      await service.create('u1', { postId: 'p1', body: longBody });

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'x'.repeat(100) + '...',
        }),
      );
    });

    it('rejects a second reply to the same parent comment by the same author', async () => {
      prisma.comment.findFirst.mockResolvedValue({
        id: 'existing-reply',
        authorId: 'u1',
        parentId: 'parent-1',
      });

      await expect(
        service.create('u1', {
          postId: 'p1',
          parentId: 'parent-1',
          body: 'Another reply',
        }),
      ).rejects.toMatchObject({
        response: { exc: 'EX_CONFLICT_DUPLICATE' },
      });
      expect(prisma.comment.findFirst).toHaveBeenCalledWith({
        where: { authorId: 'u1', parentId: 'parent-1', deletedAt: null },
      });
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it('allows the reply when no existing (non-deleted) reply exists', async () => {
      prisma.comment.findFirst.mockResolvedValue(null);
      prisma.comment.create.mockResolvedValue({
        id: 'c2',
        body: 'First reply',
        postId: 'p1',
        authorId: 'u1',
        parentId: 'parent-1',
      });
      prisma.post.findUnique.mockResolvedValue({
        authorId: 'post-author',
        title: 'My Post',
      });

      await expect(
        service.create('u1', {
          postId: 'p1',
          parentId: 'parent-1',
          body: 'First reply',
        }),
      ).resolves.toMatchObject({ id: 'c2' });
    });
  });

  describe('update', () => {
    it('updates the comment body when the caller owns it', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'c1',
        authorId: 'u1',
        postId: 'p1',
        deletedAt: null,
      });
      prisma.comment.update.mockResolvedValue({
        id: 'c1',
        body: 'Updated body',
      });

      const result = await service.update('c1', 'u1', {
        body: 'Updated body',
      });

      expect(result.body).toBe('Updated body');
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { body: 'Updated body' },
        include: { author: true },
      });
      expect(mockRealtime.emitToTopic).toHaveBeenCalledWith(
        'post:p1',
        expect.any(Object),
      );
    });

    it('includes imageUrl in the update only when explicitly provided', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'c1',
        authorId: 'u1',
        postId: 'p1',
        deletedAt: null,
      });
      prisma.comment.update.mockResolvedValue({ id: 'c1' });

      await service.update('c1', 'u1', {
        body: 'New body',
        imageUrl: 'https://img.example.com/a.png',
      });

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: {
          body: 'New body',
          imageUrl: 'https://img.example.com/a.png',
        },
        include: { author: true },
      });
    });

    it('throws NotFoundException when the comment does not exist', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', 'u1', { body: 'x' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the comment is soft-deleted', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'c1',
        authorId: 'u1',
        postId: 'p1',
        deletedAt: new Date(),
      });

      await expect(service.update('c1', 'u1', { body: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when the caller does not own the comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'c1',
        authorId: 'someone-else',
        postId: 'p1',
        deletedAt: null,
      });

      await expect(
        service.update('c1', 'u1', { body: 'x' }),
      ).rejects.toMatchObject({
        response: { exc: 'EX_FORBIDDEN' },
      });
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('soft-deletes the comment (sets deletedAt) when the caller owns it', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'c1',
        authorId: 'u1',
        postId: 'p1',
        deletedAt: null,
      });
      prisma.comment.update.mockResolvedValue({
        id: 'c1',
        deletedAt: new Date(),
      });

      const result = await service.delete('c1', 'u1');

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { deletedAt: expect.any(Date) as never },
      });
      expect(mockRealtime.emitToTopic).toHaveBeenCalledWith(
        'feed',
        expect.any(Object),
      );
    });

    it('throws NotFoundException for a comment that is already deleted', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'c1',
        authorId: 'u1',
        postId: 'p1',
        deletedAt: new Date(),
      });

      await expect(service.delete('c1', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when deleting a comment owned by someone else', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'c1',
        authorId: 'owner',
        postId: 'p1',
        deletedAt: null,
      });

      await expect(service.delete('c1', 'intruder')).rejects.toMatchObject({
        response: { exc: 'EX_FORBIDDEN' },
      });
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });
  });

  describe('findByPost', () => {
    it('fetches non-deleted top-level comments with nested replies', async () => {
      const comments = [{ id: 'c1', body: 'Top comment', replies: [] }];
      prisma.comment.findMany.mockResolvedValue(comments);

      const result = await service.findByPost('p1');

      expect(result).toEqual(comments);
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postId: 'p1', deletedAt: null, parentId: null },
        }),
      );
    });
  });
});
