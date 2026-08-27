import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService } from './livekit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs } from '../realtime/realtime.types';
// Native @prisma/client enums here, NOT the @generated/prisma/*.enum
// GraphQL-registration wrappers those files provide — this service only
// ever compares against Prisma query-result values (call.state, etc.), and
// TS enums are nominally typed: the GraphQL wrapper files declare a
// structurally-identical but distinct type that a bare `===`/`!==` against
// a query result won't type-check against cleanly.
import {
  CallEndState,
  RtcParticipantRole,
  RtcRoomKind,
  RtcRoomState,
} from '@prisma/client';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { displayName } from '../common/utils/display-name';
import { callMaxDurationMinutes } from './rtc-tier-limits.constants';
import { NotificationService } from '../notification/notification.service';
import { FriendsService } from '../friends/friends.service';
import { rtcErrorLog, rtcLog } from './rtc-logger';

// Ported from voice-call-system's own client-side ring convention (the
// reference repo has no server-side ring-timeout at all — foreground-only,
// no timer). 45s matches its README's documented ring window.
const RING_TIMEOUT_SECONDS = 45;
// How long before the tier-scaled duration cap a warning frame fires.
const CALL_LIMIT_WARNING_LEAD_SECONDS = 60;

const ACTIVE_STATES = [
  CallEndState.RINGING,
  CallEndState.CONNECTING,
  CallEndState.CONNECTED,
];

interface CallPeer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** hideAvatar contract (see the schema field's doc): another user must never
 *  receive this user's avatarUrl when the toggle is on. Every payload here is
 *  peer-facing (invite frames, snapshots, history rows), so redaction applies
 *  unconditionally — the owner's own UI never renders their avatar from these. */
function visibleAvatarUrl(user: {
  avatarUrl: string | null;
  hideAvatar: boolean;
}): string | null {
  return user.hideAvatar ? null : (user.avatarUrl ?? null);
}

export interface CallHistoryEntry {
  id: string;
  peer: CallPeer;
  direction: 'incoming' | 'outgoing';
  hasVideo: boolean;
  state: string;
  ringingAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  endReason: string | null;
}

/**
 * 1:1 call state machine. Ports voice-call-system's call.service.ts
 * validation rules (no self-call, busy-if-active, accept/reject/cancel only
 * by the real participant) onto this repo's transport: frames arrive via
 * RtcCallWsGateway's RealtimeGateway.registerHandler registrations, never a
 * Socket.IO namespace of its own. "Busy" and multi-replica correctness are
 * both resolved by reading CallSession from Postgres rather than an
 * in-memory map — the reference repo's in-memory userActiveCall map only
 * works because it's single-instance; this app assumes N replicas
 * (RealtimeGateway's own Redis pub/sub fan-out is built around that).
 *
 * Ring-timeout and duration-cap timers are plain in-process setTimeouts on
 * whichever replica handled the invite/accept. If that replica restarts
 * mid-timer the call can be left stranded in RINGING/CONNECTED with nothing
 * to unstick it — a known, accepted gap for this phase (the same class of
 * problem the meeting-duration sweep, planned for Phase 3, will solve
 * properly with a cross-replica mechanism). Calls are short-lived enough,
 * and replica restarts rare enough, that this doesn't need solving twice.
 */
@Injectable()
export class RtcCallService {
  private readonly logger = new Logger(RtcCallService.name);
  private readonly ringTimers = new Map<string, NodeJS.Timeout>();
  private readonly durationTimers = new Map<string, NodeJS.Timeout[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly liveKit: LiveKitService,
    private readonly realtime: RealtimeGateway,
    private readonly notifications: NotificationService,
    private readonly friends: FriendsService,
  ) {}

  async invite(
    ws: AuthWs,
    calleeId: unknown,
    hasVideo: unknown,
  ): Promise<void> {
    if (!ws.userId || typeof calleeId !== 'string' || !calleeId) return;
    const callerId = ws.userId;

    if (calleeId === callerId) {
      this.logger.warn(
        rtcLog('call.invite_rejected', {
          reason: 'self_call',
          userId: callerId,
        }),
      );
      this.sendError(ws, 'self_call');
      return;
    }
    // Same gate DMs enforce: only friends can ring each other. Without it,
    // any authenticated user could pop a full-screen incoming-call UI (with
    // ringtone) on any online user id they picked — a harassment vector the
    // rest of the messaging product already closes off.
    if (!(await this.friends.areFriends(callerId, calleeId))) {
      this.logger.warn(
        rtcLog('call.invite_rejected', {
          callerId,
          calleeId,
          reason: 'not_friends',
        }),
      );
      this.sendError(ws, 'not_friends');
      return;
    }
    if (!this.realtime.onlineCount.has(calleeId)) {
      this.logger.warn(
        rtcLog('call.invite_rejected', {
          callerId,
          calleeId,
          reason: 'callee_offline',
        }),
      );
      this.sendError(ws, 'callee_offline');
      return;
    }
    if (await this.hasActiveCall(callerId, calleeId)) {
      this.logger.warn(
        rtcLog('call.invite_rejected', {
          callerId,
          calleeId,
          reason: 'busy',
        }),
      );
      this.sendError(ws, 'busy');
      return;
    }

    // Created together, atomically — a crash between two separate top-level
    // creates here would leave an orphaned PENDING RtcRoom with no
    // CallSession ever pointing at it (no LiveKit room exists yet at invite
    // time, so unlike accept()'s LiveKit-setup path there's no external
    // resource to leak, but it's still a dead, permanently-unreachable row).
    const call = await this.prisma.$transaction(async (tx) => {
      const room = await tx.rtcRoom.create({
        data: {
          kind: RtcRoomKind.CALL,
          state: RtcRoomState.PENDING,
          createdById: callerId,
        },
      });
      return tx.callSession.create({
        data: {
          roomId: room.id,
          callerId,
          calleeId,
          state: CallEndState.RINGING,
          hasVideo: Boolean(hasVideo),
        },
        include: { caller: true },
      });
    });

    this.startRingTimeout(call.id);

    this.logger.log(
      rtcLog('call.invited', {
        callId: call.id,
        callerId,
        calleeId,
        hasVideo: call.hasVideo,
        phase: call.state,
      }),
    );

    this.realtime.emitToUser(callerId, {
      type: 'rtc:ringing',
      callId: call.id,
    });
    this.realtime.emitToUser(calleeId, {
      type: 'rtc:invite',
      callId: call.id,
      callerId,
      callerName: displayName(call.caller),
      callerAvatarUrl: visibleAvatarUrl(call.caller),
      hasVideo: call.hasVideo,
    });
  }

  async accept(ws: AuthWs, callId: unknown): Promise<void> {
    if (!ws.userId || typeof callId !== 'string' || !callId) return;
    // Claim the ringing row atomically. Without this transition, two accept
    // frames can both mint rooms/tokens and race to create the same
    // participants, leaving the call in an indeterminate state.
    const claimed = await this.prisma.callSession.updateMany({
      where: {
        id: callId,
        calleeId: ws.userId,
        state: CallEndState.RINGING,
      },
      data: { state: CallEndState.CONNECTING },
    });
    if (claimed.count !== 1) {
      this.logger.warn(
        rtcLog('call.accept_rejected', {
          callId,
          userId: ws.userId,
          reason: 'not_ringing_or_not_callee',
        }),
      );
      this.sendError(ws, 'call_unavailable', callId);
      return;
    }

    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
      include: { caller: true },
    });
    if (!call) {
      this.logger.error(
        rtcLog('call.accept_lookup_failed', {
          callId,
          userId: ws.userId,
        }),
      );
      this.sendError(ws, 'call_unavailable', callId);
      return;
    }
    this.clearRingTimeout(callId);

    const [caller, callee] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: call.callerId },
        select: { subscriptionTier: true },
      }),
      this.prisma.user.findUnique({
        where: { id: call.calleeId },
        select: { subscriptionTier: true },
      }),
    ]);
    const maxDurationMinutes = callMaxDurationMinutes(
      (caller?.subscriptionTier ?? SubscriptionTier.FREE) as SubscriptionTier,
      (callee?.subscriptionTier ?? SubscriptionTier.FREE) as SubscriptionTier,
    );

    const livekitRoomName = `call-${call.id}`;
    try {
      await this.liveKit.createRoom(livekitRoomName, 2);
      const [callerToken, calleeToken] = await Promise.all([
        this.liveKit.mintToken({
          identity: call.callerId,
          roomName: livekitRoomName,
          canPublish: true,
          canSubscribe: true,
        }),
        this.liveKit.mintToken({
          identity: call.calleeId,
          roomName: livekitRoomName,
          canPublish: true,
          canSubscribe: true,
        }),
      ]);

      const now = new Date();
      const connectedClaim = await this.prisma.callSession.updateMany({
        where: { id: call.id, state: CallEndState.CONNECTING },
        data: {
          state: CallEndState.CONNECTED,
          acceptedAt: now,
          maxDurationMinutes,
        },
      });
      if (connectedClaim.count !== 1) {
        // Lost the race: something else (e.g. a concurrent hangup) already
        // moved this call out of CONNECTING while LiveKit setup was in
        // flight. Whoever won already sent its own notification — we're not
        // authoritative here, so just clean up the room we just minted and
        // stop, without touching CallSession/RtcRoom state again.
        await this.liveKit.deleteRoom(livekitRoomName).catch((cleanupErr) => {
          this.logger.error(
            rtcErrorLog('call.orphaned_room_cleanup_failed', cleanupErr, {
              callId,
              roomName: livekitRoomName,
            }),
          );
        });
        this.logger.warn(
          rtcLog('call.accept_raced', {
            callId,
            callerId: call.callerId,
            calleeId: call.calleeId,
            reason: 'ended_during_livekit_setup',
          }),
        );
        return;
      }

      await this.prisma.$transaction([
        this.prisma.rtcRoom.update({
          where: { id: call.roomId },
          data: { state: RtcRoomState.ACTIVE, livekitRoomName, startedAt: now },
        }),
        this.prisma.rtcParticipant.createMany({
          data: [
            {
              roomId: call.roomId,
              userId: call.callerId,
              role: RtcParticipantRole.CALLER,
              livekitIdentity: call.callerId,
            },
            {
              roomId: call.roomId,
              userId: call.calleeId,
              role: RtcParticipantRole.CALLEE,
              livekitIdentity: call.calleeId,
            },
          ],
        }),
      ]);

      this.startDurationCap(call.id, maxDurationMinutes);

      this.logger.log(
        rtcLog('call.accepted', {
          callId,
          callerId: call.callerId,
          calleeId: call.calleeId,
          hasVideo: call.hasVideo,
          roomName: livekitRoomName,
          maxDurationMinutes,
          phase: CallEndState.CONNECTED,
        }),
      );

      this.realtime.emitToUser(call.callerId, {
        type: 'rtc:accepted',
        callId,
        token: callerToken,
        roomName: livekitRoomName,
        maxDurationMinutes,
      });
      this.realtime.emitToUser(call.calleeId, {
        type: 'rtc:accepted',
        callId,
        token: calleeToken,
        roomName: livekitRoomName,
        maxDurationMinutes,
      });
    } catch (err) {
      this.logger.error(
        rtcErrorLog('call.livekit_setup_failed', err, {
          callId,
          callerId: call.callerId,
          calleeId: call.calleeId,
          hasVideo: call.hasVideo,
          roomName: livekitRoomName,
          phase: CallEndState.CONNECTING,
        }),
      );
      const ended = await this.endCall(
        call.id,
        [CallEndState.CONNECTING, CallEndState.CONNECTED],
        CallEndState.FAILED,
        'failed',
      );
      if (!ended) return;
      this.logger.error(
        rtcLog('call.failed', {
          callId,
          callerId: call.callerId,
          calleeId: call.calleeId,
          reason: 'livekit_setup_failed',
          phase: CallEndState.FAILED,
        }),
      );
      const frame = { type: 'rtc:hangup', callId, reason: 'failed' };
      this.realtime.emitToUser(call.callerId, frame);
      this.realtime.emitToUser(call.calleeId, frame);
    }
  }

  async reject(ws: AuthWs, callId: unknown): Promise<void> {
    if (!ws.userId || typeof callId !== 'string' || !callId) return;
    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (call?.calleeId !== ws.userId || call.state !== CallEndState.RINGING) {
      this.logger.warn(
        rtcLog('call.reject_rejected', {
          callId,
          userId: ws.userId,
          reason: 'not_ringing_or_not_callee',
        }),
      );
      return;
    }
    const ended = await this.endCall(
      callId,
      [CallEndState.RINGING],
      CallEndState.REJECTED,
      'rejected',
    );
    if (!ended) {
      this.logger.warn(
        rtcLog('call.reject_raced', {
          callId,
          callerId: call.callerId,
          calleeId: call.calleeId,
          reason: 'already_transitioned',
        }),
      );
      return;
    }
    this.logger.log(
      rtcLog('call.rejected', {
        callId,
        callerId: call.callerId,
        calleeId: call.calleeId,
        reason: 'rejected',
        phase: CallEndState.REJECTED,
      }),
    );
    this.realtime.emitToUser(call.callerId, { type: 'rtc:rejected', callId });
  }

  async cancel(ws: AuthWs, callId: unknown): Promise<void> {
    if (!ws.userId || typeof callId !== 'string' || !callId) return;
    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (call?.callerId !== ws.userId || call.state !== CallEndState.RINGING) {
      this.logger.warn(
        rtcLog('call.cancel_rejected', {
          callId,
          userId: ws.userId,
          reason: 'not_ringing_or_not_caller',
        }),
      );
      return;
    }
    const ended = await this.endCall(
      callId,
      [CallEndState.RINGING],
      CallEndState.CANCELLED,
      'cancelled',
    );
    if (!ended) {
      this.logger.warn(
        rtcLog('call.cancel_raced', {
          callId,
          callerId: call.callerId,
          calleeId: call.calleeId,
          reason: 'already_transitioned',
        }),
      );
      return;
    }
    this.logger.log(
      rtcLog('call.cancelled', {
        callId,
        callerId: call.callerId,
        calleeId: call.calleeId,
        reason: 'cancelled',
        phase: CallEndState.CANCELLED,
      }),
    );
    this.realtime.emitToUser(call.calleeId, { type: 'rtc:cancelled', callId });
  }

  async hangup(ws: AuthWs, callId: unknown): Promise<void> {
    if (!ws.userId || typeof callId !== 'string' || !callId) return;
    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (!call || (call.callerId !== ws.userId && call.calleeId !== ws.userId)) {
      this.logger.warn(
        rtcLog('call.hangup_rejected', {
          callId,
          userId: ws.userId,
          reason: 'not_participant',
        }),
      );
      return;
    }
    if (
      call.state !== CallEndState.CONNECTED &&
      call.state !== CallEndState.CONNECTING
    ) {
      this.logger.warn(
        rtcLog('call.hangup_rejected', {
          callId,
          userId: ws.userId,
          reason: 'not_connected',
          phase: call.state,
        }),
      );
      return;
    }
    const ended = await this.endCall(
      callId,
      [CallEndState.CONNECTED, CallEndState.CONNECTING],
      CallEndState.ENDED,
      'hangup',
    );
    if (!ended) {
      this.logger.warn(
        rtcLog('call.hangup_raced', {
          callId,
          userId: ws.userId,
          reason: 'already_transitioned',
        }),
      );
      return;
    }
    this.logger.log(
      rtcLog('call.ended', {
        callId,
        callerId: call.callerId,
        calleeId: call.calleeId,
        reason: 'hangup',
        phase: CallEndState.ENDED,
      }),
    );
    const otherId = call.callerId === ws.userId ? call.calleeId : call.callerId;
    this.realtime.emitToUser(otherId, {
      type: 'rtc:hangup',
      callId,
      reason: 'hangup',
    });
  }

  /**
   * Called from RtcCallWsGateway's registerDisconnectHandler for the RINGING
   * phase only — once a LiveKit room exists, handlePeerLeft/
   * handleRoomEndedByLiveKit (LiveKit webhook-driven) are the authoritative
   * "actually left" signal, not a WS close. Runs unconditionally on any
   * socket close rather than checking "was this the user's last socket" —
   * RealtimeGateway.onlineCount isn't decremented until after disconnect
   * handlers run, so that check can't be made reliably here; a multi-device
   * user with one dead tab mid-ring is a rare, low-stakes edge case (worst
   * case: a premature cancel/miss, callable again) not worth new core-gateway
   * surface to solve precisely.
   */
  async handleDisconnect(ws: AuthWs): Promise<void> {
    if (!ws.userId) return;
    const userId = ws.userId;
    const calls = await this.prisma.callSession.findMany({
      where: {
        state: CallEndState.RINGING,
        OR: [{ callerId: userId }, { calleeId: userId }],
      },
    });
    for (const call of calls) {
      if (call.callerId === userId) {
        const ended = await this.endCall(
          call.id,
          [CallEndState.RINGING],
          CallEndState.CANCELLED,
          'cancelled',
        );
        if (!ended) continue;
        this.logger.log(
          rtcLog('call.cancelled', {
            callId: call.id,
            callerId: call.callerId,
            calleeId: call.calleeId,
            reason: 'socket_disconnect',
            phase: CallEndState.CANCELLED,
          }),
        );
        this.realtime.emitToUser(call.calleeId, {
          type: 'rtc:cancelled',
          callId: call.id,
        });
      } else {
        const ended = await this.endCall(
          call.id,
          [CallEndState.RINGING],
          CallEndState.MISSED,
          'missed',
        );
        if (!ended) continue;
        this.logger.log(
          rtcLog('call.missed', {
            callId: call.id,
            callerId: call.callerId,
            calleeId: call.calleeId,
            reason: 'callee_socket_disconnect',
            phase: CallEndState.MISSED,
          }),
        );
        this.realtime.emitToUser(call.callerId, {
          type: 'rtc:missed',
          callId: call.id,
        });
        this.notifyMissedCall(call);
      }
    }
  }

  /** LiveKit `participant_left` for a CALL-kind room: one side leaving a
   *  2-party call means the call is over — don't wait for LiveKit's own
   *  60s departureTimeout to notice. */
  async handlePeerLeft(roomId: string): Promise<void> {
    const call = await this.prisma.callSession.findUnique({
      where: { roomId },
    });
    if (call?.state !== CallEndState.CONNECTED) return;
    const ended = await this.endCall(
      call.id,
      [CallEndState.CONNECTED],
      CallEndState.ENDED,
      'hangup',
    );
    if (!ended) return;
    this.logger.log(
      rtcLog('call.ended', {
        callId: call.id,
        callerId: call.callerId,
        calleeId: call.calleeId,
        reason: 'peer_left',
        phase: CallEndState.ENDED,
      }),
    );
    const frame = { type: 'rtc:hangup', callId: call.id, reason: 'hangup' };
    this.realtime.emitToUser(call.callerId, frame);
    this.realtime.emitToUser(call.calleeId, frame);
  }

  /** LiveKit `room_finished` for a CALL-kind room: safety net for whenever
   *  handlePeerLeft didn't already close things out (e.g. both parties'
   *  connections drop near-simultaneously). Idempotent via the state guard —
   *  a no-op if the call was already ended. */
  async handleRoomEndedByLiveKit(roomId: string): Promise<void> {
    const call = await this.prisma.callSession.findUnique({
      where: { roomId },
    });
    if (
      !call ||
      (call.state !== CallEndState.CONNECTED &&
        call.state !== CallEndState.CONNECTING)
    ) {
      return;
    }
    const ended = await this.endCall(
      call.id,
      [CallEndState.CONNECTED, CallEndState.CONNECTING],
      CallEndState.ENDED,
      'hangup',
    );
    if (!ended) return;
    this.logger.log(
      rtcLog('call.ended', {
        callId: call.id,
        callerId: call.callerId,
        calleeId: call.calleeId,
        reason: 'room_finished',
        phase: CallEndState.ENDED,
      }),
    );
    const frame = { type: 'rtc:hangup', callId: call.id, reason: 'hangup' };
    this.realtime.emitToUser(call.callerId, frame);
    this.realtime.emitToUser(call.calleeId, frame);
  }

  /**
   * On-demand snapshot for a client that just (re)connected and may have
   * missed a point-in-time WS push — same "pull covers a race" idea as
   * messaging's get-room-members. Returns the same frame shapes rtc:invite/
   * rtc:accepted use, so the frontend/mobile hook can feed this through the
   * exact same reducer path as a live WS frame.
   */
  async getActiveCallSnapshot(
    userId: string,
  ): Promise<Record<string, unknown> | null> {
    const call = await this.prisma.callSession.findFirst({
      where: {
        OR: [{ callerId: userId }, { calleeId: userId }],
        state: { in: [CallEndState.RINGING, CallEndState.CONNECTED] },
      },
      include: { caller: true, callee: true, room: true },
      orderBy: { ringingAt: 'desc' },
    });
    if (!call) return null;

    if (call.state === CallEndState.RINGING) {
      // The caller already received rtc:ringing at invite time; only the
      // callee needs a snapshot to recover a missed rtc:invite push.
      if (call.calleeId !== userId) return null;
      return {
        type: 'rtc:invite',
        callId: call.id,
        callerId: call.callerId,
        callerName: displayName(call.caller),
        callerAvatarUrl: visibleAvatarUrl(call.caller),
        hasVideo: call.hasVideo,
      };
    }

    if (!call.room.livekitRoomName) return null;
    const token = await this.liveKit.mintToken({
      identity: userId,
      roomName: call.room.livekitRoomName,
      canPublish: true,
      canSubscribe: true,
    });
    // Unlike the live rtc:accepted push (which the client already has peer
    // info for, carried over from rtc:invite/startCall), this recovery path
    // is a client's first look at the call after a refresh — it needs the
    // peer identified from scratch.
    const peer = userId === call.callerId ? call.callee : call.caller;
    return {
      type: 'rtc:accepted',
      callId: call.id,
      peerId: peer.id,
      peerName: displayName(peer),
      peerAvatarUrl: visibleAvatarUrl(peer),
      token,
      roomName: call.room.livekitRoomName,
      maxDurationMinutes: call.maxDurationMinutes ?? undefined,
    };
  }

  async getCallHistory(
    userId: string,
    before: string | undefined,
    take: number,
  ): Promise<{ hasMore: boolean; calls: CallHistoryEntry[] }> {
    const calls = await this.prisma.callSession.findMany({
      where: {
        OR: [{ callerId: userId }, { calleeId: userId }],
        state: { notIn: ACTIVE_STATES },
        ...(before ? { ringingAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { ringingAt: 'desc' },
      take: take + 1,
      include: { caller: true, callee: true },
    });
    const hasMore = calls.length > take;
    const page = calls.slice(0, take);
    return {
      hasMore,
      calls: page.map((c) => ({
        id: c.id,
        peer:
          c.callerId === userId
            ? {
                id: c.calleeId,
                name: displayName(c.callee),
                avatarUrl: visibleAvatarUrl(c.callee),
              }
            : {
                id: c.callerId,
                name: displayName(c.caller),
                avatarUrl: visibleAvatarUrl(c.caller),
              },
        direction: c.callerId === userId ? 'outgoing' : 'incoming',
        hasVideo: c.hasVideo,
        state: c.state,
        ringingAt: c.ringingAt.toISOString(),
        acceptedAt: c.acceptedAt?.toISOString() ?? null,
        endedAt: c.endedAt?.toISOString() ?? null,
        endReason: c.endReason,
      })),
    };
  }

  private async hasActiveCall(...userIds: string[]): Promise<boolean> {
    const count = await this.prisma.callSession.count({
      where: {
        OR: [{ callerId: { in: userIds } }, { calleeId: { in: userIds } }],
        state: { in: ACTIVE_STATES },
      },
    });
    return count > 0;
  }

  /**
   * Atomically claims callId out of one of `fromStates` into `state`. Every
   * caller below used to read-then-write (a findUnique guard, then this
   * method did an unconditional update) — a TOCTOU race: two concurrent
   * transitions (e.g. accept() vs. a same-instant cancel()) could each pass
   * their own stale read and both proceed, with whichever write committed
   * last silently overwriting the other, while BOTH callers still notified
   * their users regardless of which write actually won. Returns false if the
   * claim lost the race — callers must treat that as "someone else already
   * ended this call" and skip their own logging/notification rather than
   * sending a second, possibly-contradictory frame.
   */
  private async endCall(
    callId: string,
    fromStates: CallEndState[],
    state: CallEndState,
    endReason: string,
  ): Promise<boolean> {
    this.clearRingTimeout(callId);
    this.clearDurationTimers(callId);
    const now = new Date();
    const claimed = await this.prisma.callSession.updateMany({
      where: { id: callId, state: { in: fromStates } },
      data: { state, endedAt: now, endReason },
    });
    if (claimed.count !== 1) return false;
    const call = await this.prisma.callSession.findUniqueOrThrow({
      where: { id: callId },
    });
    const room = await this.prisma.rtcRoom.update({
      where: { id: call.roomId },
      data: { state: RtcRoomState.ENDED, endedAt: now },
    });
    if (room.livekitRoomName) {
      await this.liveKit.deleteRoom(room.livekitRoomName);
    }
    return true;
  }

  private startRingTimeout(callId: string): void {
    const timer = setTimeout(() => {
      void this.handleRingTimeout(callId).catch((error) => {
        this.logger.error(
          rtcErrorLog('call.ring_timeout_failed', error, { callId }),
        );
      });
    }, RING_TIMEOUT_SECONDS * 1000);
    this.ringTimers.set(callId, timer);
  }

  private clearRingTimeout(callId: string): void {
    const timer = this.ringTimers.get(callId);
    if (!timer) return;
    clearTimeout(timer);
    this.ringTimers.delete(callId);
  }

  private async handleRingTimeout(callId: string): Promise<void> {
    this.ringTimers.delete(callId);
    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (call?.state !== CallEndState.RINGING) return;
    const ended = await this.endCall(
      callId,
      [CallEndState.RINGING],
      CallEndState.MISSED,
      'missed',
    );
    if (!ended) return;
    this.logger.log(
      rtcLog('call.missed', {
        callId,
        callerId: call.callerId,
        calleeId: call.calleeId,
        reason: 'ring_timeout',
        phase: CallEndState.MISSED,
      }),
    );
    this.realtime.emitToUser(call.callerId, { type: 'rtc:missed', callId });
    this.realtime.emitToUser(call.calleeId, { type: 'rtc:missed', callId });
    this.notifyMissedCall(call);
  }

  /** Fire-and-forget: the callee gets a persisted MISSED_CALL notification
   *  (falls back to a push if they have no live NOTIFICATION socket, per
   *  NotificationService.create's own rule) so a missed call surfaces even
   *  after the rtc:missed WS frame above was sent to nobody listening. */
  private notifyMissedCall(call: {
    id: string;
    callerId: string;
    calleeId: string;
  }): void {
    void (async () => {
      const caller = await this.prisma.user.findUnique({
        where: { id: call.callerId },
        select: { name: true, email: true },
      });
      await this.notifications.create({
        userId: call.calleeId,
        actorId: call.callerId,
        type: 'MISSED_CALL',
        title: `Missed call from ${displayName(caller ?? { name: null, email: 'Someone' })}`,
        payload: { kind: 'rtc-missed-call', callId: call.id },
      });
    })().catch((err: Error) =>
      this.logger.error(
        rtcErrorLog('call.missed_notification_failed', err, {
          callId: call.id,
          callerId: call.callerId,
          calleeId: call.calleeId,
        }),
      ),
    );
  }

  private startDurationCap(callId: string, maxDurationMinutes: number): void {
    const totalMs = maxDurationMinutes * 60_000;
    const warnMs = Math.max(
      totalMs - CALL_LIMIT_WARNING_LEAD_SECONDS * 1000,
      0,
    );
    const timers: NodeJS.Timeout[] = [];
    if (warnMs > 0) {
      timers.push(
        setTimeout(() => {
          void this.sendCallLimitWarning(callId).catch((error) => {
            this.logger.error(
              rtcErrorLog('call.limit_warning_failed', error, { callId }),
            );
          });
        }, warnMs),
      );
    }
    timers.push(
      setTimeout(() => {
        void this.forceCallLimitHangup(callId).catch((error) => {
          this.logger.error(
            rtcErrorLog('call.limit_hangup_failed', error, { callId }),
          );
        });
      }, totalMs),
    );
    this.durationTimers.set(callId, timers);
  }

  private clearDurationTimers(callId: string): void {
    const timers = this.durationTimers.get(callId);
    if (!timers) return;
    timers.forEach(clearTimeout);
    this.durationTimers.delete(callId);
  }

  private async sendCallLimitWarning(callId: string): Promise<void> {
    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (call?.state !== CallEndState.CONNECTED) return;
    const frame = {
      type: 'rtc:call-limit-warning',
      callId,
      secondsRemaining: CALL_LIMIT_WARNING_LEAD_SECONDS,
    };
    this.realtime.emitToUser(call.callerId, frame);
    this.realtime.emitToUser(call.calleeId, frame);
    this.logger.log(
      rtcLog('call.limit_warning', {
        callId,
        callerId: call.callerId,
        calleeId: call.calleeId,
        secondsRemaining: CALL_LIMIT_WARNING_LEAD_SECONDS,
        phase: call.state,
      }),
    );
  }

  private async forceCallLimitHangup(callId: string): Promise<void> {
    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (call?.state !== CallEndState.CONNECTED) return;
    const ended = await this.endCall(
      callId,
      [CallEndState.CONNECTED],
      CallEndState.ENDED,
      'tier_limit',
    );
    if (!ended) return;
    this.logger.log(
      rtcLog('call.ended', {
        callId,
        callerId: call.callerId,
        calleeId: call.calleeId,
        reason: 'tier_limit',
        phase: CallEndState.ENDED,
      }),
    );
    const frame = { type: 'rtc:hangup', callId, reason: 'tier_limit' };
    this.realtime.emitToUser(call.callerId, frame);
    this.realtime.emitToUser(call.calleeId, frame);
  }

  private sendError(ws: AuthWs, reason: string, callId?: string): void {
    this.logger.warn(
      rtcLog('call.error_sent', {
        callId,
        userId: ws.userId,
        reason,
      }),
    );
    ws.send(
      JSON.stringify({
        type: 'rtc:error',
        reason,
        ...(callId ? { callId } : {}),
      }),
    );
  }
}
