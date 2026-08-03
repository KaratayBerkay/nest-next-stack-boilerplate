import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WrappedSenderKey {
  senderDeviceId: string;
  epoch: number;
  recipientDeviceId: string;
  wrappedKey: Uint8Array;
  wrapNonce: Uint8Array;
}

@Injectable()
export class E2eeRoomsService {
  private readonly logger = new Logger(E2eeRoomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async publishSenderKeys(
    roomId: string,
    senderDeviceId: string,
    epoch: number,
    keys: Omit<WrappedSenderKey, 'senderDeviceId' | 'epoch'>[],
  ): Promise<number> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });
    if (!room) return 0;

    const result = await this.prisma.roomSenderKeyDistribution.createMany({
      data: keys.map((k) => ({
        roomId,
        senderDeviceId,
        epoch,
        recipientDeviceId: k.recipientDeviceId,
        wrappedKey: Buffer.from(k.wrappedKey),
        wrapNonce: Buffer.from(k.wrapNonce),
      })),
      skipDuplicates: true,
    });

    this.logger.debug(
      `publishSenderKeys room=${roomId} epoch=${epoch} count=${result.count}`,
    );
    return result.count;
  }

  async fetchSenderKeys(
    roomId: string,
    recipientDeviceId: string,
    afterEpoch?: number,
  ) {
    const where: Record<string, unknown> = {
      roomId,
      recipientDeviceId,
    };
    if (afterEpoch !== undefined) {
      where.epoch = { gt: afterEpoch };
    }

    return this.prisma.roomSenderKeyDistribution.findMany({
      where,
      orderBy: [{ epoch: 'asc' }, { createdAt: 'asc' }],
      select: {
        senderDeviceId: true,
        epoch: true,
        wrappedKey: true,
        wrapNonce: true,
        createdAt: true,
      },
    });
  }

  async getRoomMembers(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { slug: roomId },
      select: {
        id: true,
        participants: {
          where: { leftAt: null },
          select: {
            userId: true,
            role: true,
            joinedAt: true,
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!room) return [];

    return room.participants;
  }

  async deleteSenderKeysForEpoch(
    roomId: string,
    senderDeviceId: string,
    epoch: number,
  ): Promise<number> {
    const result = await this.prisma.roomSenderKeyDistribution.deleteMany({
      where: { roomId, senderDeviceId, epoch },
    });
    return result.count;
  }
}
