import {
  PostResolver,
  type PostStats,
  type ReactionCount,
} from './post.resolver';

function makePost(overrides?: {
  reactions?: Array<{
    type: string;
    userId: string;
    user?: { name: string | null } | null;
  }>;
}) {
  return {
    id: 'p1',
    title: 'Test',
    content: 'Body',
    coverImage: null,
    imageUrl: null,
    createdAt: new Date(),
    authorId: 'u1',
    deletedAt: null,
    createdAt: new Date(),
    ...overrides,
  } as never;
}

describe('PostResolver', () => {
  let resolver: PostResolver;

  beforeEach(() => {
    resolver = new PostResolver({ getMyPostStats: jest.fn() } as never);
  });

  describe('reactionBreakdown', () => {
    it('returns empty array when no reactions', () => {
      const result = resolver.reactionBreakdown(makePost());
      expect(result).toEqual([]);
    });

    it('groups reactions by type with correct counts', () => {
      const post = makePost({
        reactions: [
          { type: 'LIKE', userId: 'u1' },
          { type: 'LIKE', userId: 'u2' },
          { type: 'LOVE', userId: 'u3' },
        ],
      });
      const result = resolver.reactionBreakdown(post);
      expect(result).toHaveLength(2);
      expect(result.find((r: ReactionCount) => r.type === 'LIKE')?.count).toBe(
        2,
      );
      expect(result.find((r: ReactionCount) => r.type === 'LOVE')?.count).toBe(
        1,
      );
    });
  });

  describe('whoReacted', () => {
    it('returns empty array when no reactions', () => {
      const result = resolver.whoReacted(makePost());
      expect(result).toEqual([]);
    });

    it('maps reactions to reactors with user names', () => {
      const post = makePost({
        reactions: [
          { type: 'LIKE', userId: 'u1', user: { name: 'Alice' } },
          { type: 'LOVE', userId: 'u2', user: null },
        ],
      });
      const result = resolver.whoReacted(post);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ userId: 'u1', name: 'Alice', type: 'LIKE' });
      expect(result[1]).toEqual({
        userId: 'u2',
        name: undefined,
        type: 'LOVE',
      });
    });
  });

  describe('coverImage', () => {
    it('returns null when no cover image', () => {
      expect(resolver.coverImage(makePost())).toBeNull();
    });

    it('returns base64 encoded cover image', () => {
      const buf = Buffer.from('test-image');
      const post = makePost();
      post.coverImage = buf;
      expect(resolver.coverImage(post)).toBe(buf.toString('base64'));
    });
  });

  describe('imageUrl', () => {
    it('returns null when no image url', () => {
      expect(resolver.imageUrl(makePost())).toBeNull();
    });

    it('returns image url when present', () => {
      const post = makePost();
      post.imageUrl = '/uploads/test.jpg';
      expect(resolver.imageUrl(post)).toBe('/uploads/test.jpg');
    });
  });

  describe('myPostStats', () => {
    it('delegates to postService.getMyPostStats', async () => {
      const mockStats: PostStats = {
        totalPosts: 5,
        totalReactions: 12,
        avgReactionsPerPost: 2.4,
      };
      (resolver as never).postService = {
        getMyPostStats: jest.fn().mockResolvedValue(mockStats),
      };
      const result = await resolver.myPostStats({ userId: 'u1' } as never);
      expect(result).toEqual(mockStats);
      expect(
        (resolver as unknown as { postService: { getMyPostStats: jest.Mock } })
          .postService.getMyPostStats,
      ).toHaveBeenCalledWith('u1');
    });
  });
});
