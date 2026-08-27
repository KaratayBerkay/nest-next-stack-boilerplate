import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../types/rtc/active_call_snapshot.dart';
import '../realtime/realtime_client.dart' show RealtimeStatus;
import '../realtime/realtime_provider.dart';
import 'rtc_call_state.dart';
import 'rtc_telemetry.dart';

/// Riverpod mirror of next-js-boilerplate's RtcCallProvider.tsx reducer —
/// same phase transitions, same guard conditions. Fed by
/// realtime_provider.dart's handleEventFrame (rtc:* cases dispatch into this
/// notifier) rather than owning its own WS subscription — this app funnels
/// every frame through one central switch, unlike web's per-type
/// `realtime.subscribe(type, handler)`.
final rtcCallProvider =
    StateNotifierProvider<RtcCallNotifier, RtcCallState>((ref) {
  return RtcCallNotifier(ref);
});

class RtcCallNotifier extends StateNotifier<RtcCallState> {
  final Ref _ref;

  RtcCallNotifier(this._ref) : super(RtcCallState.idle);

  void startCall(RtcCallPeer peer, bool hasVideo) {
    if (_ref.read(realtimeStatusProvider) != RealtimeStatus.open) {
      logRtcEvent(
        event: 'call.invite_failed',
        rtcKind: 'call',
        mediaType: hasVideo ? 'video' : 'audio',
        phase: 'idle',
        exceptionType: 'CLIENT_ERROR',
        error: 'realtime_unavailable',
      );
      return;
    }
    state = RtcCallState(
      phase: RtcCallPhase.outgoingRinging,
      peer: peer,
      hasVideo: hasVideo,
    );
    logRtcEvent(
      event: 'call.invite_sent',
      rtcKind: 'call',
      mediaType: hasVideo ? 'video' : 'audio',
      phase: 'outgoing-ringing',
      metadata: {'peerId': peer.id},
    );
    _ref.read(realtimeProvider).send({
      'type': 'rtc:invite',
      'calleeId': peer.id,
      'hasVideo': hasVideo,
    });
  }

  void acceptCall() {
    final callId = state.callId;
    if (callId == null) return;
    logRtcEvent(
      event: 'call.accept_sent',
      rtcKind: 'call',
      rtcId: callId,
      mediaType: state.hasVideo ? 'video' : 'audio',
      phase: 'incoming-ringing',
    );
    _ref.read(realtimeProvider).send({
      'type': 'rtc:accept',
      'callId': callId,
    });
  }

  void rejectCall() {
    final callId = state.callId;
    if (callId == null) return;
    logRtcEvent(
      event: 'call.reject_sent',
      rtcKind: 'call',
      rtcId: callId,
      mediaType: state.hasVideo ? 'video' : 'audio',
      phase: 'incoming-ringing',
    );
    _ref.read(realtimeProvider).send({
      'type': 'rtc:reject',
      'callId': callId,
    });
    state = RtcCallState.idle;
  }

  void cancelCall() {
    final callId = state.callId;
    if (callId == null) return;
    logRtcEvent(
      event: 'call.cancel_sent',
      rtcKind: 'call',
      rtcId: callId,
      mediaType: state.hasVideo ? 'video' : 'audio',
      phase: 'outgoing-ringing',
    );
    _ref.read(realtimeProvider).send({
      'type': 'rtc:cancel',
      'callId': callId,
    });
    state = RtcCallState.idle;
  }

  void hangupCall() {
    final callId = state.callId;
    if (callId == null) return;
    logRtcEvent(
      event: 'call.hangup_sent',
      rtcKind: 'call',
      rtcId: callId,
      mediaType: state.hasVideo ? 'video' : 'audio',
      phase: 'connected',
    );
    _ref.read(realtimeProvider).send({
      'type': 'rtc:hangup',
      'callId': callId,
    });
    state = RtcCallState.idle;
  }

  // ---- driven by realtime_provider.dart's handleEventFrame ----

  void onRinging(String callId) {
    if (state.phase != RtcCallPhase.outgoingRinging || state.callId != null) {
      return;
    }
    state = state.copyWith(callId: callId);
    logRtcEvent(
      event: 'call.ringing_received',
      rtcKind: 'call',
      rtcId: callId,
      phase: 'outgoing-ringing',
    );
  }

  void onIncoming(String callId, RtcCallPeer peer, bool hasVideo) {
    if (state.phase != RtcCallPhase.idle) return;
    state = RtcCallState(
      phase: RtcCallPhase.incomingRinging,
      callId: callId,
      peer: peer,
      hasVideo: hasVideo,
    );
    logRtcEvent(
      event: 'call.invite_received',
      rtcKind: 'call',
      rtcId: callId,
      mediaType: hasVideo ? 'video' : 'audio',
      phase: 'incoming-ringing',
    );
  }

  void onAccepted(
    String callId,
    String token,
    String roomName,
    int? maxDurationMinutes, {
    RtcCallPeer? peer,
  }) {
    final validPhase = state.phase == RtcCallPhase.outgoingRinging ||
        state.phase == RtcCallPhase.incomingRinging;
    if (!validPhase || (state.callId != null && state.callId != callId)) {
      return;
    }
    state = state.copyWith(
      phase: RtcCallPhase.connected,
      callId: callId,
      peer: peer,
      livekit: RtcLiveKitInfo(
        token: token,
        roomName: roomName,
        maxDurationMinutes: maxDurationMinutes,
      ),
    );
    logRtcEvent(
      event: 'call.accepted_received',
      rtcKind: 'call',
      rtcId: callId,
      roomName: roomName,
      phase: 'connected',
    );
  }

  void onWarning(String callId, int secondsRemaining) {
    if (state.callId != callId) return;
    logRtcEvent(
      event: 'call.limit_warning_received',
      rtcKind: 'call',
      rtcId: callId,
      phase: 'connected',
      metadata: {'secondsRemaining': secondsRemaining},
    );
    state = state.copyWith(warningSecondsRemaining: secondsRemaining);
  }

  void onEnded(String callId, {String reason = 'ended'}) {
    if (state.callId != callId) return;
    logRtcEvent(
      event: 'call.ended_received',
      rtcKind: 'call',
      rtcId: callId,
      mediaType: state.hasVideo ? 'video' : 'audio',
      phase: state.phase.name,
      metadata: {'reason': reason},
    );
    state = RtcCallState.idle;
  }

  // Not named onError — that collides with StateNotifier's own inherited
  // error-handling member of the same name.
  void onCallError(String? callId, String reason) {
    if (callId != null && state.callId != null && state.callId != callId) {
      return;
    }
    logRtcEvent(
      event: 'call.error_received',
      rtcKind: 'call',
      rtcId: callId,
      exceptionType: 'CLIENT_ERROR',
      error: reason,
      phase: state.phase.name,
    );
    state = RtcCallState(lastError: reason);
  }

  /// Recovery path for a client that (re)connected and may have missed the
  /// point-in-time rtc:invite/rtc:accepted push — see resyncAfterConnect,
  /// which invalidates activeCallProvider on every WS (re)connect.
  void applySnapshot(ActiveCallSnapshot? snapshot) {
    if (snapshot == null || state.phase != RtcCallPhase.idle) return;
    if (snapshot.type == 'rtc:invite' && snapshot.callerId != null) {
      onIncoming(
        snapshot.callId,
        RtcCallPeer(
          id: snapshot.callerId!,
          name: snapshot.callerName ?? '',
          avatarUrl: snapshot.callerAvatarUrl,
        ),
        snapshot.hasVideo ?? false,
      );
    } else if (snapshot.type == 'rtc:accepted' &&
        snapshot.token != null &&
        snapshot.roomName != null) {
      // Seed outgoing/incoming phase first so onAccepted's guard accepts it —
      // this is a cold-start recovery, not a live frame sequence.
      state = state.copyWith(
        phase: RtcCallPhase.outgoingRinging,
        callId: snapshot.callId,
      );
      onAccepted(
        snapshot.callId,
        snapshot.token!,
        snapshot.roomName!,
        snapshot.maxDurationMinutes,
        peer: snapshot.peerId != null
            ? RtcCallPeer(
                id: snapshot.peerId!,
                name: snapshot.peerName ?? '',
                avatarUrl: snapshot.peerAvatarUrl,
              )
            : null,
      );
    }
  }
}
