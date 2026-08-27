import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs } from '../realtime/realtime.types';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { displayName } from '../common/utils/display-name';

export interface RtcChatMessageView {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  text: string;
  createdAt: string;
}

/**
 * The encrypted-at-rest room-chat mechanics shared identically by meetings
 * and live streams (and available to calls, if a future phase ever wants
 * one) — everything downstream of "I already know this socket/user is an
 * active participant of roomId, addressed by this WS channel key." Slug
 * resolution and the active-participant guard stay in RtcMeetingService/
 * RtcStreamService respectively (that part genuinely differs — a Meeting
 * lookup vs. a LiveStream lookup), but once a caller has a roomId+channel in
 * hand, persisting/broadcasting/paginating a chat message is identical.
 * Pulled out after the two services' hand-copied versions of this showed up
 * as flagged duplication.
 */
@Injectable()
export class RtcChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly storageCrypto: StorageCryptoService,
  ) {}

  registerSocket(channel: string, ws: AuthWs): void {
    this.realtime.registerRoomSocket(channel, ws);
  }

  leaveSocket(channel: string, socketId: string | undefined): void {
    if (!socketId) return;
    this.realtime.leaveRoomSocket(channel, socketId);
  }

  async sendMessage(params: {
    channel: string;
    slug: string;
    roomId: string;
    senderId: string;
    text: string;
  }): Promise<void> {
    const { channel, slug, roomId, senderId, text } = params;
    const { v, ct, nonce } = this.storageCrypto.encryptForRtcRoom({ text });
    const saved = await this.prisma.rtcChatMessage.create({
      data: { roomId, senderId, v, ct, nonce },
      include: { sender: true },
    });

    await this.realtime.emitToRoomEncrypted(channel, {
      type: 'rtc:chat-message',
      slug,
      message: {
        id: saved.id,
        senderId: saved.senderId,
        senderName: displayName(saved.sender),
        // hideAvatar contract: these frames reach every room member, so the
        // avatar is withheld outright when the sender hides it (same rule the
        // realtime gateway applies to chat-room member lists).
        senderAvatarUrl: saved.sender.hideAvatar
          ? null
          : (saved.sender.avatarUrl ?? null),
        text,
        createdAt: saved.createdAt.toISOString(),
      },
    });
  }

  async getHistory(
    roomId: string,
    before: string | undefined,
    take: number,
  ): Promise<{ hasMore: boolean; messages: RtcChatMessageView[] }> {
    const rows = await this.prisma.rtcChatMessage.findMany({
      where: {
        roomId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      include: { sender: true },
    });
    const hasMore = rows.length > take;
    const page = rows.slice(0, take);
    return {
      hasMore,
      messages: page.map((row) => ({
        id: row.id,
        senderId: row.senderId,
        senderName: displayName(row.sender),
        // Same hideAvatar withholding as the live broadcast above.
        senderAvatarUrl: row.sender.hideAvatar
          ? null
          : (row.sender.avatarUrl ?? null),
        text: this.decryptText(row),
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async markParticipantLeft(roomId: string, userId: string): Promise<void> {
    await this.prisma.rtcParticipant.updateMany({
      where: { roomId, userId, leftAt: null },
      data: { leftAt: new Date() },
    });
  }

  /** The generic half of each service's own activeParticipant(userId, slug)
   *  guard — resolving slug → roomId stays domain-specific (a Meeting vs. a
   *  LiveStream lookup), but "is this user currently a non-departed
   *  participant of this room" is identical once you have a roomId. */
  async isActiveParticipant(roomId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.rtcParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    return Boolean(participant && !participant.leftAt);
  }

  private decryptText(row: { v: string; ct: string; nonce: string }): string {
    try {
      const decrypted = this.storageCrypto.decryptForRtcRoom({
        v: row.v,
        ct: row.ct,
        nonce: row.nonce,
      }) as { text?: string };
      return decrypted.text ?? '';
    } catch {
      return '';
    }
  }
}
