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
}
