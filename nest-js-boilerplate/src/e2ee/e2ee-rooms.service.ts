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

  /** Resolves the externally-used room slug to its internal UUID id — every
   * other room-facing identifier in this app (WS frames, RoomMessage.roomId)
   * is the plain slug, so these endpoints accept that too rather than
   * requiring callers to separately know the Room row's id. */
  private async resolveRoomId(roomSlug: string): Promise<string | null> {
    const room = await this.prisma.room.findUnique({
      where: { slug: roomSlug },
      select: { id: true },
    });
    return room?.id ?? null;
  }

  async publishSenderKeys(
    roomSlug: string,
    senderDeviceId: string,
    epoch: number,
    keys: Omit<WrappedSenderKey, 'senderDeviceId' | 'epoch'>[],
  ): Promise<number> {
    const roomId = await this.resolveRoomId(roomSlug);
    if (!roomId) return 0;

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
      `publishSenderKeys room=${roomSlug} epoch=${epoch} count=${result.count}`,
    );
    return result.count;
  }

  async fetchSenderKeys(
    roomSlug: string,
    recipientDeviceId: string,
    afterEpoch?: number,
  ) {
    const roomId = await this.resolveRoomId(roomSlug);
    if (!roomId) return [];

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
        membershipVersion: true,
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
    if (!room) return { membershipVersion: 0, members: [] };

    return {
      membershipVersion: room.membershipVersion,
      members: room.participants,
    };
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
