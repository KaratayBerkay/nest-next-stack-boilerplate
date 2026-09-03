import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccessToken,
  RoomServiceClient,
  TrackType,
  WebhookReceiver,
  type VideoGrant,
} from 'livekit-server-sdk';
import { decryptId, encryptId } from '../common/id-codec/id-codec';
import { rtcErrorLog } from './rtc-logger';

interface MintTokenOptions {
  /** Raw user uuid — encrypted into the id-codec token form before it ever
   *  reaches LiveKit (see toLivekitIdentity below). */
  identity: string;
  name?: string;
  roomName: string;
  canPublish: boolean;
  canSubscribe: boolean;
  ttlSeconds?: number;
}

/**
 * LiveKit participant identities travel THROUGH the clients: they ride the
 * signed access token, and every room peer can read every other peer's
 * identity off the LiveKit room object. Raw database uuids must never reach
 * a client (the id-codec transport-boundary rule), so identities are the
 * deterministic encryptId() form of the userId. This is also what makes the
 * clients actually work: both web and Flutter compare LiveKit identities
 * against ids they got from GraphQL (stream viewers look the broadcaster up
 * by `stream.broadcaster.id`; meeting hosts pass `participant.identity` back
 * as the mute/remove target, where the arg decryptor expects an encrypted
 * token) — with raw uuids on the LiveKit side those comparisons could never
 * match and the mute/remove args failed decryption outright.
 */
export function toLivekitIdentity(userId: string): string {
  return encryptId(userId);
}

/**
 * LiveKit room names travel the same client-visible paths as identities:
 * they ride the signed access token's grant, are readable off the client's
 * Room object, and appear in every LiveKit webhook and log line. Embedding
 * the raw database uuid (`call-<uuid>`) therefore leaked ids the id-codec
 * carefully encrypts everywhere else. Room names are only ever resolved
 * back to rows via the RtcRoom.livekitRoomName column (never parsed), so
 * the id half is safe to replace with its deterministic encryptId() form —
 * still operator-decryptable for debugging, opaque to everyone else.
 */
export function toLivekitRoomName(
  kind: 'call' | 'meeting' | 'stream',
  rawId: string,
): string {
  return `${kind}-${encryptId(rawId)}`;
}

/** Reverse of toLivekitIdentity for webhook payloads. Tolerates identities
 *  minted before encryption existed (older live sessions during a deploy):
 *  a value that doesn't decrypt is returned as-is. */
export function fromLivekitIdentity(identity: string): string {
  try {
    return decryptId(identity);
  } catch {
    return identity;
  }
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
  /**
   * The ws(s):// URL *clients* connect to (LIVEKIT_URL), as opposed to
   * LIVEKIT_HTTP_URL, which is this server's own admin-API endpoint and is
   * often an internal address (host.docker.internal). Handed back on every
   * join result / call frame so clients don't each need a compile-time copy
   * that can silently drift — the Flutter app shipped pointing at its own
   * loopback for exactly that reason (MOB-034). Null when unset: clients
   * then fall back to their own configured URL.
   */
  readonly clientUrl: string | null;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('LIVEKIT_API_KEY', 'devkey');
    this.apiSecret = this.config.get<string>('LIVEKIT_API_SECRET', 'devsecret');
    this.clientUrl = this.config.get<string>('LIVEKIT_URL', '').trim() || null;
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
      identity: toLivekitIdentity(opts.identity),
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
      departureTimeout: 15,
    });
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
    } catch (err) {
      // Already gone (e.g. LiveKit's own empty-room timeout beat us to it)
      // — not an error from the caller's point of view.
      this.logger.warn(
        rtcErrorLog('livekit.room_delete_failed', err, { roomName }),
      );
    }
  }

  /** `identity` is the raw userId — translated to the LiveKit-side encrypted
   *  identity here, so callers never handle the codec themselves. */
  async removeParticipant(roomName: string, identity: string): Promise<void> {
    try {
      await this.roomService.removeParticipant(
        roomName,
        toLivekitIdentity(identity),
      );
    } catch (error) {
      this.logger.error(
        rtcErrorLog('livekit.participant_remove_failed', error, {
          roomName,
          participantId: identity,
        }),
      );
      throw error;
    }
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

  /**
   * Host-driven mute. LiveKit has no "mute by identity" call — muting a
   * published track requires its trackSid, so this looks the participant up
   * first to find their current audio track. A best-effort no-op (not an
   * error) if the participant or their room has already gone away.
   */
  async muteParticipantAudio(
    roomName: string,
    identity: string,
    muted: boolean,
  ): Promise<void> {
    try {
      const livekitIdentity = toLivekitIdentity(identity);
      const participant = await this.roomService.getParticipant(
        roomName,
        livekitIdentity,
      );
      const audioTrack = participant.tracks.find(
        (t) => t.type === TrackType.AUDIO,
      );
      if (!audioTrack) return;
      await this.roomService.mutePublishedTrack(
        roomName,
        livekitIdentity,
        audioTrack.sid,
        muted,
      );
    } catch (err) {
      this.logger.warn(
        rtcErrorLog('livekit.participant_mute_failed', err, {
          roomName,
          participantId: identity,
          muted,
        }),
      );
    }
  }

  /** Whether `identity` (raw userId) currently has a live participant
   *  session in `roomName`. Used to tell a genuine departure apart from
   *  livekit-client's own leave-then-rejoin full reconnect. Any lookup
   *  failure — participant gone, room gone, LiveKit unreachable — counts
   *  as "not connected". */
  async isParticipantConnected(
    roomName: string,
    identity: string,
  ): Promise<boolean> {
    try {
      await this.roomService.getParticipant(
        roomName,
        toLivekitIdentity(identity),
      );
      return true;
    } catch {
      return false;
    }
  }

  async listParticipantCount(roomName: string): Promise<number> {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants.length;
    } catch (error) {
      // Room doesn't exist (never started, or already ended) — zero live
      // viewers, not an error.
      this.logger.warn(
        rtcErrorLog('livekit.participant_count_unavailable', error, {
          roomName,
        }),
      );
      return 0;
    }
  }

  /** Verifies and decodes a LiveKit webhook POST body. Throws on a bad signature. */
  async verifyWebhookEvent(rawBody: string, authHeader: string | undefined) {
    return this.webhookReceiver.receive(rawBody, authHeader);
  }
}
