import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });
    return friendships.map((f) =>
      f.requesterId === userId ? f.addresseeId : f.requesterId,
    );
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    if (userId1 === userId2) return false;
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId1, addresseeId: userId2 },
          { requesterId: userId2, addresseeId: userId1 },
        ],
        status: 'ACCEPTED',
      },
    });
    return !!friendship;
  }

  /**
   * Given a set of seed user IDs, return a map of candidate → mutual count
   * where candidates are NOT in excludeIds and mutual count = how many seed
   * users are friends with that candidate.
   */
  async getMutualCounts(
    seedIds: string[],
    excludeIds: Set<string>,
  ): Promise<Map<string, number>> {
    if (seedIds.length === 0) return new Map();

    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: { in: seedIds } },
          { addresseeId: { in: seedIds } },
        ],
      },
    });

    const counts = new Map<string, number>();
    for (const f of friendships) {
      const seedId =
        seedIds.indexOf(f.requesterId) >= 0 ? f.requesterId : f.addresseeId;
      const candidateId =
        f.requesterId === seedId ? f.addresseeId : f.requesterId;

      if (!excludeIds.has(candidateId)) {
        counts.set(candidateId, (counts.get(candidateId) ?? 0) + 1);
      }
    }

    return counts;
  }
}
