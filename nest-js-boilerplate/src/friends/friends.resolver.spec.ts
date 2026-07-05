import { FriendsResolver } from './friends.resolver';

describe('FriendsResolver', () => {
  let resolver: FriendsResolver;
  let mockFriends: {
    getFriendIds: jest.Mock;
    getMutualCounts: jest.Mock;
  };
  let mockPrisma: {
    user: { findMany: jest.Mock };
  };

  beforeEach(() => {
    mockFriends = {
      getFriendIds: jest.fn().mockResolvedValue(['f1', 'f2']),
      getMutualCounts: jest.fn(),
    };
    mockPrisma = {
      user: { findMany: jest.fn() },
    };

    resolver = new FriendsResolver(mockFriends as never, mockPrisma as never);
  });

  describe('suggestedFriends', () => {
    it('returns empty when no mutual counts', async () => {
      mockFriends.getMutualCounts.mockResolvedValue(new Map());
      const result = await resolver.suggestedFriends({ userId: 'u1' } as never);
      expect(result).toEqual([]);
    });

    it('returns top candidates sorted by mutual friends', async () => {
      const mutualCounts = new Map([
        ['c1', 5],
        ['c2', 3],
        ['c3', 1],
      ]);
      mockFriends.getMutualCounts.mockResolvedValue(mutualCounts);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'c1', name: 'Alice', email: 'a@test.com', avatarUrl: null },
        {
          id: 'c2',
          name: 'Bob',
          email: 'b@test.com',
          avatarUrl: '/avatar.jpg',
        },
      ]);

      const result = await resolver.suggestedFriends({ userId: 'u1' } as never);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('c1');
      expect(result[0].mutualFriends).toBe(5);
      expect(result[1].id).toBe('c2');
      expect(result[1].mutualFriends).toBe(3);
    });

    it('excludes the user and their existing friends', async () => {
      mockFriends.getMutualCounts.mockResolvedValue(new Map());
      await resolver.suggestedFriends({ userId: 'u1' } as never);
      expect(mockFriends.getFriendIds).toHaveBeenCalledWith('u1');
      const callArgs = mockFriends.getMutualCounts.mock.calls[0] as [
        string[],
        Set<string>,
      ];
      const excludeIds = callArgs[1];
      expect(excludeIds.has('u1')).toBe(true);
      expect(excludeIds.has('f1')).toBe(true);
      expect(excludeIds.has('f2')).toBe(true);
    });

    it('maps null name to undefined', async () => {
      mockFriends.getMutualCounts.mockResolvedValue(new Map([['c1', 2]]));
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'c1', name: null, email: 'c@test.com', avatarUrl: null },
      ]);

      const result = await resolver.suggestedFriends({ userId: 'u1' } as never);
      expect(result[0].name).toBeUndefined();
    });
  });
});
