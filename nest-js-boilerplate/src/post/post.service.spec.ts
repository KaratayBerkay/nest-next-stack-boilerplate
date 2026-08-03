import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let prisma: {
    post: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let cache: { getOrFetch: jest.Mock };

  const commentSelect = {
    id: true,
    body: true,
    createdAt: true,
    parentId: true,
    authorId: true,
    author: { select: { id: true, name: true, email: true } },
    reactions: {
      take: 50,
      select: {
        id: true,
        type: true,
        userId: true,
        user: { select: { name: true } },
      },
    },
    _count: { select: { replies: true } },
  };

  beforeEach(() => {
    prisma = {
      post: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };
    cache = {
      getOrFetch: jest.fn(async (_key: string, fn: () => Promise<unknown>) =>
        fn(),
      ),
    };
    service = new PostService(
      prisma as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      cache as never,
    );
  });

  describe('findOne', () => {
    it('does not filter comments to top-level, so replies reach the client', async () => {
      const postWithReplies = {
        id: 'p1',
        comments: [
          {
            ...commentSelect,
            id: 'c1',
            body: 'Top-level',
            parentId: null,
            authorId: 'u1',
          },
          {
            ...commentSelect,
            id: 'c2',
            body: 'A reply',
            parentId: 'c1',
            authorId: 'u2',
          },
        ],
      };
      prisma.post.findFirst.mockResolvedValue(postWithReplies);

      const result = await service.findOne('p1');

      expect(result).toEqual(postWithReplies);
      const args = (prisma.post.findFirst.mock.calls[0] as unknown[])[0] as {
        select: {
          comments: {
            where: { deletedAt: Date | null };
            take: number;
            select: { parentId: boolean };
          };
        };
      };
      expect(args.select.comments.where).toEqual({ deletedAt: null });
      expect(args.select.comments.take).toBeGreaterThan(20);
      expect(args.select.comments.select.parentId).toBe(true);
    });
  });
});
