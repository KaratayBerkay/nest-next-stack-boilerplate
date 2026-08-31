/// Mirrors next-js-boilerplate's RtcCallProvider.tsx state shape exactly —
/// same phase names, same frame types drive the same transitions. Kept as a
/// plain immutable value class (not a StateNotifier itself; see
/// rtc_call_provider.dart for the notifier).
enum RtcCallPhase { idle, outgoingRinging, incomingRinging, connected }

/// A user action whose ack frame (rtc:accepted / rtc:cancelled / rtc:error)
/// hasn't arrived yet — while set, the overlay disables the triggering
/// controls so a double-tap can't send duplicate frames.
enum RtcCallAction { accept, cancel, hangup }

class RtcCallPeer {
  final String id;
  final String name;
  final String? avatarUrl;

  const RtcCallPeer({required this.id, required this.name, this.avatarUrl});
}

class RtcLiveKitInfo {
  final String token;
  final String roomName;
  final int? maxDurationMinutes;

  const RtcLiveKitInfo({
    required this.token,
    required this.roomName,
    this.maxDurationMinutes,
  });
}

class RtcCallState {
  final RtcCallPhase phase;
  final String? callId;
  final RtcCallPeer? peer;
  final bool hasVideo;
  final RtcLiveKitInfo? livekit;

  /// Server-side acceptedAt of the connected call — seeds the overlay timer
  /// so a snapshot recovery doesn't restart the readout from 0:00 (mirrors
  /// web's RtcCallState.connectedAt).
  final DateTime? connectedAt;
  final int? warningSecondsRemaining;
  final String? lastError;
  final RtcCallAction? actionPending;

  const RtcCallState({
    this.phase = RtcCallPhase.idle,
    this.callId,
    this.peer,
    this.hasVideo = true,
    this.livekit,
    this.connectedAt,
    this.warningSecondsRemaining,
    this.lastError,
    this.actionPending,
  });

  static const idle = RtcCallState();

  static const Object _unset = Object();

  RtcCallState copyWith({
    RtcCallPhase? phase,
    String? callId,
    RtcCallPeer? peer,
    bool? hasVideo,
    RtcLiveKitInfo? livekit,
    DateTime? connectedAt,
    int? warningSecondsRemaining,
    String? lastError,
    // Sentinel default so callers can clear the pending action with an
    // explicit `actionPending: null` (the `??` pattern can't express that).
    Object? actionPending = _unset,
  }) {
    return RtcCallState(
      phase: phase ?? this.phase,
      callId: callId ?? this.callId,
      peer: peer ?? this.peer,
      hasVideo: hasVideo ?? this.hasVideo,
      livekit: livekit ?? this.livekit,
      connectedAt: connectedAt ?? this.connectedAt,
      warningSecondsRemaining:
          warningSecondsRemaining ?? this.warningSecondsRemaining,
      lastError: lastError ?? this.lastError,
      actionPending: identical(actionPending, _unset)
          ? this.actionPending
          : actionPending as RtcCallAction?,
    );
  }
}
