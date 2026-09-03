import 'dart:async';

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

  /// A cancel tapped before the rtc:ringing frame delivered the callId —
  /// the invite and its callId travel on separate frames, so keep the call
  /// alive just long enough to cancel it as soon as the id arrives.
  bool _cancelRequested = false;

  /// Bounds the wait for an ack frame after accept/cancel — a dropped
  /// rtc:accepted/rtc:cancelled/rtc:error frame would otherwise leave the
  /// overlay permanently non-interactive (the pending action disables its
  /// controls) with no way out. Same 10s bound as the web provider.
  Timer? _actionTimer;

  RtcCallNotifier(this._ref) : super(RtcCallState.idle);

  @override
  void dispose() {
    _actionTimer?.cancel();
    super.dispose();
  }

  void _setActionPending(RtcCallAction action) {
    state = state.copyWith(actionPending: action);
    _actionTimer?.cancel();
    final pendingCallId = state.callId;
    final pendingPhase = state.phase;
    _actionTimer = Timer(const Duration(seconds: 10), () {
      if (!mounted || state.actionPending != action) return;
      logRtcEvent(
        event: 'call.action_timeout',
        rtcKind: 'call',
        rtcId: pendingCallId,
        phase: pendingPhase.name,
        exceptionType: 'CLIENT_ERROR',
        error: '${action.name}_ack_timeout',
      );
      _cancelRequested = false;
      state = const RtcCallState(lastError: 'action_timeout');
    });
  }

  void _clearActionTimer() {
    _actionTimer?.cancel();
    _actionTimer = null;
  }

  void startCall(RtcCallPeer peer, bool hasVideo) {
    if (state.phase != RtcCallPhase.idle) return;
    if (_ref.read(realtimeStatusProvider) != RealtimeStatus.open) {
      logRtcEvent(
        event: 'call.invite_failed',
        rtcKind: 'call',
        mediaType: hasVideo ? 'video' : 'audio',
        phase: 'idle',
        exceptionType: 'CLIENT_ERROR',
        error: 'realtime_unavailable',
        metadata: {'peerId': peer.id},
      );
      state = const RtcCallState(lastError: 'realtime_unavailable');
      return;
    }
    _cancelRequested = false;
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
    if (callId == null ||
        state.phase != RtcCallPhase.incomingRinging ||
        state.actionPending != null) {
      return;
    }
    if (_ref.read(realtimeStatusProvider) != RealtimeStatus.open) {
      logRtcEvent(
        event: 'call.accept_failed',
        rtcKind: 'call',
        rtcId: callId,
        phase: 'incoming-ringing',
        exceptionType: 'CLIENT_ERROR',
        error: 'realtime_unavailable',
      );
      state = const RtcCallState(lastError: 'realtime_unavailable');
      return;
    }
    _setActionPending(RtcCallAction.accept);
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
    if (callId == null ||
        state.phase != RtcCallPhase.incomingRinging ||
        state.actionPending != null) {
      return;
    }
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
    _clearActionTimer();
    state = RtcCallState.idle;
  }

  void cancelCall() {
    if (state.phase != RtcCallPhase.outgoingRinging ||
        state.actionPending != null) {
      return;
    }
    final callId = state.callId;
    if (callId == null) {
      // The invite and its callId travel on separate frames. Keep the call
      // alive just long enough to cancel it as soon as the id arrives
      // (onRinging below consumes this flag).
      _cancelRequested = true;
      logRtcEvent(
        event: 'call.cancel_requested',
        rtcKind: 'call',
        mediaType: state.hasVideo ? 'video' : 'audio',
        phase: 'outgoing-ringing',
      );
      _setActionPending(RtcCallAction.cancel);
      return;
    }
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
    _clearActionTimer();
    state = RtcCallState.idle;
  }

  void hangupCall() {
    final callId = state.callId;
    if (callId == null || state.phase != RtcCallPhase.connected) return;
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
    _clearActionTimer();
    state = RtcCallState.idle;
  }

  /// Clears a surfaced [RtcCallState.lastError] once the UI has shown it.
  void dismissError() {
    if (state.lastError == null) return;
    state = RtcCallState.idle;
  }

  // ---- driven by realtime_provider.dart's handleEventFrame ----

  void onRinging(String callId) {
    if (state.phase != RtcCallPhase.outgoingRinging || state.callId != null) {
      return;
    }
    if (_cancelRequested) {
      // Cancel was tapped before the callId existed — finish it now.
      _cancelRequested = false;
      _ref.read(realtimeProvider).send({
        'type': 'rtc:cancel',
        'callId': callId,
      });
      logRtcEvent(
        event: 'call.cancel_sent',
        rtcKind: 'call',
        rtcId: callId,
        phase: 'outgoing-ringing',
        metadata: {'reason': 'cancel_before_call_id'},
      );
      _clearActionTimer();
      state = RtcCallState.idle;
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
    // Server-stamped client URL for this call (rtc:accepted `livekitUrl`).
    String? livekitUrl,
    RtcCallPeer? peer,
    // Snapshot recovery only — the live rtc:accepted push's client already
    // knows the call type from rtc:invite/startCall. Without this, a
    // recovered audio call rendered the video UI (state default is true).
    bool? hasVideo,
    // Server-side accept time; seeds the timer so a relaunch/recovery
    // continues the readout instead of restarting at 0:00.
    DateTime? acceptedAt,
  }) {
    final validPhase = state.phase == RtcCallPhase.outgoingRinging ||
        state.phase == RtcCallPhase.incomingRinging;
    if (!validPhase || (state.callId != null && state.callId != callId)) {
      return;
    }
    _clearActionTimer();
    state = state.copyWith(
      phase: RtcCallPhase.connected,
      callId: callId,
      peer: peer,
      hasVideo: hasVideo,
      livekit: RtcLiveKitInfo(
        token: token,
        roomName: roomName,
        livekitUrl: livekitUrl,
        maxDurationMinutes: maxDurationMinutes,
      ),
      connectedAt: acceptedAt ?? DateTime.now(),
      actionPending: null,
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
    _cancelRequested = false;
    _clearActionTimer();
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
    _cancelRequested = false;
    _clearActionTimer();
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
        livekitUrl: snapshot.livekitUrl,
        peer: snapshot.peerId != null
            ? RtcCallPeer(
                id: snapshot.peerId!,
                name: snapshot.peerName ?? '',
                avatarUrl: snapshot.peerAvatarUrl,
              )
            : null,
        hasVideo: snapshot.hasVideo,
        acceptedAt: snapshot.acceptedAt != null
            ? DateTime.tryParse(snapshot.acceptedAt!)
            : null,
      );
    }
  }
}
