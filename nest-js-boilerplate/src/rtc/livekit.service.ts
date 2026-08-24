import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccessToken,
  RoomServiceClient,
  WebhookReceiver,
  type VideoGrant,
} from 'livekit-server-sdk';

interface MintTokenOptions {
  identity: string;
  name?: string;
  roomName: string;
  canPublish: boolean;
  canSubscribe: boolean;
  ttlSeconds?: number;
}

/**
 * Thin wrapper around livekit-server-sdk — the auth.service.ts analog from
 * the voice-call-system reference repo. Turns "this already-authenticated
 * user (resolved by SessionValidatorService/SessionAuthGuard before any
 * caller reaches here) wants to join room X" into a signed LiveKit grant.
 * `identity` must always come from the caller's own resolved session, never
 * from client-supplied input — every downstream LiveKit permission traces
 * back to what's passed in here.
 */
@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly roomService: RoomServiceClient;
  private readonly webhookReceiver: WebhookReceiver;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('LIVEKIT_API_KEY', 'devkey');
    this.apiSecret = this.config.get<string>('LIVEKIT_API_SECRET', 'devsecret');
    const httpUrl = this.config.get<string>(
      'LIVEKIT_HTTP_URL',
      'http://localhost:7880',
    );
    this.roomService = new RoomServiceClient(
      httpUrl,
      this.apiKey,
      this.apiSecret,
    );
    this.webhookReceiver = new WebhookReceiver(this.apiKey, this.apiSecret);
  }

  async mintToken(opts: MintTokenOptions): Promise<string> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: opts.identity,
      name: opts.name,
      ttl: opts.ttlSeconds ?? 4 * 60 * 60,
    });
    const grant: VideoGrant = {
      room: opts.roomName,
      roomJoin: true,
      canPublish: opts.canPublish,
      canSubscribe: opts.canSubscribe,
    };
    token.addGrant(grant);
    return token.toJwt();
  }

  async createRoom(roomName: string, maxParticipants?: number): Promise<void> {
    await this.roomService.createRoom({
      name: roomName,
      maxParticipants,
      // Empty rooms (nobody ever joined) and rooms every participant has
      // left both auto-close quickly — RTC rooms are ephemeral by design,
      // never meant to sit open with no one connected.
      emptyTimeout: 60,
      departureTimeout: 60,
    });
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
    } catch (err) {
      // Already gone (e.g. LiveKit's own empty-room timeout beat us to it)
      // — not an error from the caller's point of view.
      this.logger.warn(`deleteRoom(${roomName}) failed: ${(err as Error).message}`);
    }
  }

  async removeParticipant(roomName: string, identity: string): Promise<void> {
    await this.roomService.removeParticipant(roomName, identity);
  }

  async mutePublishedTrack(
    roomName: string,
    identity: string,
    trackSid: string,
    muted: boolean,
  ): Promise<void> {
    await this.roomService.mutePublishedTrack(
      roomName,
      identity,
      trackSid,
      muted,
    );
  }

  async listParticipantCount(roomName: string): Promise<number> {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants.length;
    } catch {
      // Room doesn't exist (never started, or already ended) — zero live
      // viewers, not an error.
      return 0;
    }
  }

  /** Verifies and decodes a LiveKit webhook POST body. Throws on a bad signature. */
  async verifyWebhookEvent(rawBody: string, authHeader: string | undefined) {
    return this.webhookReceiver.receive(rawBody, authHeader);
  }
}
