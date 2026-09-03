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

  describe('author', () => {
    it('withholds avatarUrl when the author has hidden it from the viewer', async () => {
      const author = {
        id: 'u1',
        name: 'Author',
        email: 'author@test.com',
        avatarUrl: '/author.jpg',
        hideAvatar: true,
      };
      const load = jest.fn().mockResolvedValue(author);
      const resolverWithLoader = new PostResolver(
        { getMyPostStats: jest.fn() } as never,
        { getUserLoader: () => ({ load }) } as never,
      );

      const result = await resolverWithLoader.author(makePost(), {
        userId: 'viewer',
      } as never);

      expect(result?.avatarUrl).toBeNull();
    });

    it('keeps avatarUrl when the viewer is the author themselves', async () => {
      const author = {
        id: 'u1',
        name: 'Author',
        email: 'author@test.com',
        avatarUrl: '/author.jpg',
        hideAvatar: true,
      };
      const load = jest.fn().mockResolvedValue(author);
      const resolverWithLoader = new PostResolver(
        { getMyPostStats: jest.fn() } as never,
        { getUserLoader: () => ({ load }) } as never,
      );

      const result = await resolverWithLoader.author(makePost(), {
        userId: 'u1',
      } as never);

      expect(result?.avatarUrl).toBe('/author.jpg');
    });
  });

  describe('reactionBreakdown', () => {
    const reactivePost = makePost({
      reactions: [
        { type: 'LIKE', userId: 'u1' },
        { type: 'LIKE', userId: 'u2' },
        { type: 'LOVE', userId: 'u3' },
      ],
    });

    it('returns empty array when no reactions', () => {
      const result = resolver.reactionBreakdown(makePost(), {
        tier: 'MEDIUM',
      } as never);
      expect(result).toEqual([]);
    });

    it('groups reactions by type with correct counts for a MEDIUM+ viewer', () => {
      const result = resolver.reactionBreakdown(reactivePost, {
        tier: 'MEDIUM',
      } as never);
      expect(result).toHaveLength(2);
      expect(result.find((r: ReactionCount) => r.type === 'LIKE')?.count).toBe(
        2,
      );
      expect(result.find((r: ReactionCount) => r.type === 'LOVE')?.count).toBe(
        1,
      );
    });

    // Regression: `@UseGuards(TierGuard)` on a `@ResolveField()` is a silent
    // no-op under this app's `fieldResolverEnhancers: ['interceptors']`
    // GraphQL config (guards never run for field resolvers) — the gate has
    // to be this imperative check, or a FREE-tier caller gets the real data.
    it('withholds the breakdown from a below-MEDIUM viewer', () => {
      const result = resolver.reactionBreakdown(reactivePost, {
        tier: 'FREE',
      } as never);
      expect(result).toEqual([]);
    });

    it('withholds the breakdown when the viewer has no tier at all', () => {
      const result = resolver.reactionBreakdown(reactivePost, {} as never);
      expect(result).toEqual([]);
    });
  });

  describe('whoReacted', () => {
    const reactivePost = makePost({
      reactions: [
        { type: 'LIKE', userId: 'u1', user: { name: 'Alice' } },
        { type: 'LOVE', userId: 'u2', user: null },
      ],
    });

    it('returns empty array when no reactions', () => {
      const result = resolver.whoReacted(makePost(), {
        tier: 'PREMIUM',
      } as never);
      expect(result).toEqual([]);
    });

    it('maps reactions to reactors with user names for a PREMIUM viewer', () => {
      const result = resolver.whoReacted(reactivePost, {
        tier: 'PREMIUM',
      } as never);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ userId: 'u1', name: 'Alice', type: 'LIKE' });
      expect(result[1]).toEqual({
        userId: 'u2',
        name: undefined,
        type: 'LOVE',
      });
    });

    // Same field-resolver-guards-don't-run regression as reactionBreakdown
    // above, at the stricter PREMIUM tier this field requires.
    it('withholds reactor identities from a below-PREMIUM viewer', () => {
      const result = resolver.whoReacted(reactivePost, {
        tier: 'MEDIUM',
      } as never);
      expect(result).toEqual([]);
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
