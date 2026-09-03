import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/rtc/livekit_url.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_state.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_telemetry.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:livekit_client/livekit_client.dart' as lk;
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../api/client/rtc/query.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/active_call_snapshot.dart';
import '../ui/avatar/avatar.dart';

/// Maps the stable, snake_case `reason` codes RtcCallService.sendError()
/// sends over the wire to localized copy — same table as the web overlay's
/// getCallErrorMessage (RtcCallOverlay.tsx).
String callErrorMessage(String reason, AppLocalizations t) {
  switch (reason) {
    case 'callee_offline':
      return t.rtcUserOffline;
    case 'busy':
      return t.rtcUserBusy;
    case 'self_call':
      return t.rtcCannotCallSelf;
    case 'call_unavailable':
      return t.rtcCallUnavailable;
    case 'realtime_unavailable':
    case 'action_timeout':
      return t.rtcConnectionUnavailable;
    default:
      return t.rtcCallErrorDescription;
  }
}

/// In-call timer readout — mirror of the web overlay's formatCallTimer.
/// Calls are duration-capped by the lower of the two parties' tiers
/// (10/25/45/120 min, backend CALL_MAX_DURATION_MINUTES), and the cap
/// arrives on rtc:accepted as maxDurationMinutes — when present the timer
/// reads "2:17 / 10:00" so the remaining allowance stays visible.
String formatCallTimer(int elapsedSeconds, int? maxDurationMinutes) {
  final elapsed = _formatMmSs(elapsedSeconds);
  if (maxDurationMinutes == null || maxDurationMinutes <= 0) return elapsed;
  return '$elapsed / ${_formatMmSs(maxDurationMinutes * 60)}';
}

String _formatMmSs(int totalSeconds) {
  final mins = totalSeconds ~/ 60;
  final secs = totalSeconds % 60;
  return '$mins:${secs.toString().padLeft(2, '0')}';
}

/// Which side's screen share (if any) owns the call's main stage — same
/// mechanics as the meeting room: an active share takes over the video
/// area and both cameras shrink to small tiles. If both sides happen to
/// share at once (rare — LiveKit allows it, a real 1:1 UI never intends
/// it), the peer's share wins since watching the other person's content is
/// the more useful default. Extracted as a pure function (mirroring
/// [formatCallTimer] above) so this precedence is unit-testable without
/// pumping the whole call overlay widget tree.
enum CallShareSource { remote, local }

CallShareSource? resolveActiveCallShare({
  required bool remoteSharing,
  required bool localSharing,
}) {
  if (remoteSharing) return CallShareSource.remote;
  if (localSharing) return CallShareSource.local;
  return null;
}

/// Global overlay for the whole 1:1-call lifecycle — incoming-ring sheet,
/// outgoing-ring/connecting screen, and the in-call video/audio + controls.
/// Mounted once at the app root (app.dart), same level as the biometric-lock
/// overlay, not per-page — a call survives navigation and can be answered
/// from any screen. Owns the LiveKit Room instance directly (connect on
/// entering `connected`, disconnect on leaving it) rather than through a
/// reusable hook — the connection lifecycle is tied 1:1 to this widget's
/// mount lifetime, so a separate hook abstraction would add nothing.
class RtcCallOverlay extends ConsumerStatefulWidget {
  const RtcCallOverlay({super.key});

  @override
  ConsumerState<RtcCallOverlay> createState() => _RtcCallOverlayState();
}

class _RtcCallOverlayState extends ConsumerState<RtcCallOverlay> {
  lk.Room? _room;
  lk.EventsListener<lk.RoomEvent>? _listener;
  String? _connectedForCallId;
  lk.VideoTrack? _localVideoTrack;
  lk.VideoTrack? _remoteVideoTrack;
  // Own shared-screen preview and the peer's incoming share — kept apart
  // from the camera tracks above so a share never overwrites the camera
  // reference the way a single shared "remote video" slot used to (both
  // are Track.Kind.video; only the source distinguishes them).
  lk.VideoTrack? _localScreenShareTrack;
  lk.VideoTrack? _remoteScreenShareTrack;
  bool _connected = false;
  bool _remoteConnected = false;
  bool _micEnabled = true;
  bool _cameraEnabled = true;
  bool _screenShareEnabled = false;
  bool _speakerEnabled = true;

  @override
  void dispose() {
    _teardownRoom();
    super.dispose();
  }

  Future<void> _teardownRoom() async {
    final listener = _listener;
    final room = _room;
    _listener = null;
    _room = null;
    _connectedForCallId = null;
    await listener?.dispose();
    await room?.disconnect();
    if (mounted) {
      setState(() {
        _localVideoTrack = null;
        _remoteVideoTrack = null;
        _localScreenShareTrack = null;
        _remoteScreenShareTrack = null;
        _connected = false;
        _remoteConnected = false;
        _micEnabled = true;
        _cameraEnabled = true;
        _screenShareEnabled = false;
        _speakerEnabled = true;
      });
    }
  }

  Future<void> _connectRoom(RtcCallState state) async {
    final livekit = state.livekit;
    if (livekit == null || _connectedForCallId == state.callId) return;
    _connectedForCallId = state.callId;

    final room = lk.Room();
    _room = room;
    final listener = room.createListener();
    _listener = listener;

    logRtcEvent(
      event: 'call.livekit.connecting',
      rtcKind: 'call',
      rtcId: state.callId,
      roomName: livekit.roomName,
      mediaType: state.hasVideo ? 'video' : 'audio',
      phase: 'connecting',
    );

    listener
      ..on<lk.TrackSubscribedEvent>((event) {
        if (event.track is! lk.VideoTrack || !mounted) return;
        final track = event.track as lk.VideoTrack;
        if (event.publication.source == lk.TrackSource.screenShareVideo) {
          setState(() => _remoteScreenShareTrack = track);
        } else {
          setState(() => _remoteVideoTrack = track);
        }
      })
      ..on<lk.TrackUnsubscribedEvent>((event) {
        if (!mounted) return;
        if (identical(event.track, _remoteVideoTrack)) {
          setState(() => _remoteVideoTrack = null);
        } else if (identical(event.track, _remoteScreenShareTrack)) {
          setState(() => _remoteScreenShareTrack = null);
        }
      })
      ..on<lk.ParticipantConnectedEvent>((_) {
        if (mounted) setState(() => _remoteConnected = true);
      })
      ..on<lk.ParticipantDisconnectedEvent>((_) {
        if (mounted) setState(() => _remoteConnected = false);
      })
      ..on<lk.RoomDisconnectedEvent>((event) {
        logRtcEvent(
          event: 'call.livekit.disconnected',
          rtcKind: 'call',
          rtcId: state.callId,
          roomName: livekit.roomName,
          mediaType: state.hasVideo ? 'video' : 'audio',
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
          metadata: {'reason': event.reason?.name},
        );
        if (mounted) setState(() => _connected = false);
        // clientInitiated means our own _teardownRoom() called disconnect()
        // — already being handled by the phase-change teardown in build()
        // below. Any other reason is an involuntary media-transport death
        // (LiveKit's own reconnect gave up) with the WS control channel
        // possibly still up, so nothing else would ever move state.phase
        // off `connected`: isConnected/showVideo in _ActiveCallScreen are
        // driven by state.phase (not this widget's local _connected), so
        // without this the UI shows a frozen last frame with a
        // "Connecting…" subtitle that nothing is actually retrying.
        // Proactively hang up so the provider, the peer, and the backend's
        // CallSession row all agree the call is over — same as a manual
        // End tap.
        if (event.reason != null &&
            event.reason != lk.DisconnectReason.clientInitiated) {
          ref.read(rtcCallProvider.notifier).hangupCall();
        }
      })
      ..on<lk.RoomReconnectingEvent>((_) {
        logRtcEvent(
          event: 'call.livekit.reconnecting',
          rtcKind: 'call',
          rtcId: state.callId,
          roomName: livekit.roomName,
          mediaType: state.hasVideo ? 'video' : 'audio',
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
        );
      })
      ..on<lk.RoomReconnectedEvent>((_) {
        logRtcEvent(
          event: 'call.livekit.reconnected',
          rtcKind: 'call',
          rtcId: state.callId,
          roomName: livekit.roomName,
          mediaType: state.hasVideo ? 'video' : 'audio',
          phase: 'connected',
        );
      })
      ..on<lk.ParticipantConnectionQualityUpdatedEvent>((event) {
        if (event.connectionQuality == lk.ConnectionQuality.poor) {
          logRtcEvent(
            event: 'call.livekit.connection_quality_poor',
            rtcKind: 'call',
            rtcId: state.callId,
            roomName: livekit.roomName,
            mediaType: state.hasVideo ? 'video' : 'audio',
            exceptionType: 'CLIENT_ERROR',
            phase: 'connected',
            metadata: {'participantId': event.participant.identity},
          );
        }
      });

    try {
      await room.connect(resolveLivekitUrl(livekit.livekitUrl), livekit.token);
      if (!mounted || _room != room) {
        await room.disconnect();
        return;
      }
      setState(() {
        _connected = true;
        _remoteConnected = room.remoteParticipants.isNotEmpty;
      });
      logRtcEvent(
        event: 'call.livekit.connected',
        rtcKind: 'call',
        rtcId: state.callId,
        roomName: livekit.roomName,
        mediaType: state.hasVideo ? 'video' : 'audio',
        phase: 'connected',
      );
      // Phone-call routing convention: video calls open on loudspeaker,
      // voice calls on the earpiece — and keep the toggle in sync with the
      // route actually applied.
      final speakerOn = state.hasVideo;
      if (mounted) setState(() => _speakerEnabled = speakerOn);
      try {
        await lk.AudioManager.instance.setSpeakerOutputPreferred(speakerOn);
      } catch (_) {
        // Desktop/web targets have no speakerphone route — ignore.
      }
      try {
        await room.localParticipant?.setMicrophoneEnabled(true);
      } catch (error, stackTrace) {
        logRtcEvent(
          event: 'call.media.microphone_enable_failed',
          rtcKind: 'call',
          rtcId: state.callId,
          roomName: livekit.roomName,
          mediaType: state.hasVideo ? 'video' : 'audio',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
      }
      if (state.hasVideo) {
        try {
          final pub = await room.localParticipant?.setCameraEnabled(true);
          final track = pub?.track;
          if (mounted && track is lk.VideoTrack) {
            final videoTrack = track as lk.VideoTrack;
            setState(() => _localVideoTrack = videoTrack);
          }
        } catch (error, stackTrace) {
          logRtcEvent(
            event: 'call.media.camera_enable_failed',
            rtcKind: 'call',
            rtcId: state.callId,
            roomName: livekit.roomName,
            mediaType: 'video',
            exceptionType: 'CLIENT_ERROR',
            error: error,
            stackTrace: stackTrace,
            phase: 'connected',
          );
        }
      } else if (mounted) {
        setState(() => _cameraEnabled = false);
      }
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'call.livekit.connection_failed',
        rtcKind: 'call',
        rtcId: state.callId,
        roomName: livekit.roomName,
        mediaType: state.hasVideo ? 'video' : 'audio',
        exceptionType: 'CLIENT_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'connecting',
      );
      // Connection failed — `_connected` stays false; the hangup control
      // lets the user bail out, and server-side duration cap / LiveKit
      // webhook cleanup aren't affected either way.
    }
  }

  void _toggleMic() {
    final room = _room;
    if (room == null) return;
    final next = !_micEnabled;
    setState(() => _micEnabled = next);
    room.localParticipant?.setMicrophoneEnabled(next).then<void>(
      (_) {},
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'call.media.microphone_toggle_failed',
          rtcKind: 'call',
          rtcId: _connectedForCallId,
          mediaType: ref.read(rtcCallProvider).hasVideo ? 'video' : 'audio',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
        // Revert the optimistic toggle rather than leaving the icon showing
        // the opposite of actual state.
        if (mounted) setState(() => _micEnabled = !next);
      },
    );
  }

  void _toggleCamera() {
    final room = _room;
    if (room == null) return;
    final next = !_cameraEnabled;
    setState(() => _cameraEnabled = next);
    room.localParticipant?.setCameraEnabled(next).then<void>(
      (pub) {
        final track = pub?.track;
        if (next && mounted && track is lk.VideoTrack) {
          final videoTrack = track as lk.VideoTrack;
          setState(() => _localVideoTrack = videoTrack);
        }
      },
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'call.media.camera_toggle_failed',
          rtcKind: 'call',
          rtcId: _connectedForCallId,
          mediaType: 'video',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
        // Revert the optimistic toggle rather than leaving the icon showing
        // the opposite of actual state.
        if (mounted) setState(() => _cameraEnabled = !next);
      },
    );
  }

  void _toggleScreenShare() {
    final room = _room;
    if (room == null) return;
    final next = !_screenShareEnabled;
    setState(() => _screenShareEnabled = next);
    room.localParticipant?.setScreenShareEnabled(next).then<void>(
      (pub) {
        if (!mounted) return;
        final track = pub?.track;
        if (next && track is lk.VideoTrack) {
          final videoTrack = track as lk.VideoTrack;
          setState(() => _localScreenShareTrack = videoTrack);
        } else if (!next) {
          setState(() => _localScreenShareTrack = null);
        }
      },
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'call.media.screen_share_toggle_failed',
          rtcKind: 'call',
          rtcId: _connectedForCallId,
          mediaType: 'video',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
        // User cancelled the OS screen-capture prompt (or it failed) —
        // revert the optimistic toggle rather than showing a stuck-on state.
        if (mounted) setState(() => _screenShareEnabled = !next);
      },
    );
  }

  void _toggleSpeaker() {
    if (_room == null) return;
    final next = !_speakerEnabled;
    setState(() => _speakerEnabled = next);
    lk.AudioManager.instance.setSpeakerOutputPreferred(next).then<void>(
      (_) {},
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'call.media.speaker_toggle_failed',
          rtcKind: 'call',
          rtcId: _connectedForCallId,
          mediaType: ref.read(rtcCallProvider).hasVideo ? 'video' : 'audio',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
        if (mounted) setState(() => _speakerEnabled = !next);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final state = ref.watch(rtcCallProvider);
    final notifier = ref.read(rtcCallProvider.notifier);

    ref.listen<RtcCallState>(rtcCallProvider, (prev, next) {
      if (next.phase == RtcCallPhase.connected && next.livekit != null) {
        _connectRoom(next);
      } else if (next.phase != RtcCallPhase.connected && _room != null) {
        _teardownRoom();
      }
      // Keep the screen awake for the whole call lifecycle (ringing
      // included) — the Flutter twin of the web's Wake Lock fix: without
      // it the display times out mid-call and Android suspends the app.
      if (next.phase != RtcCallPhase.idle && prev?.phase == RtcCallPhase.idle) {
        unawaited(WakelockPlus.enable());
      } else if (next.phase == RtcCallPhase.idle &&
          prev?.phase != RtcCallPhase.idle) {
        unawaited(WakelockPlus.disable());
      }
      // rtc:error resets the call state, so without this the overlay just
      // vanishes with zero feedback (calling an offline/busy user looked
      // like nothing happened) — mirror the web overlay's error toast.
      final error = next.lastError;
      if (error != null && error != prev?.lastError) {
        final messenger = ScaffoldMessenger.maybeOf(context);
        messenger?.showSnackBar(
          SnackBar(
            content: Text(callErrorMessage(error, t)),
            backgroundColor: colors.danger,
          ),
        );
        notifier.dismissError();
      }
    });

    ref.listen<AsyncValue<ActiveCallSnapshot?>>(activeCallProvider,
        (prev, next) {
      final snap = next.asData?.value;
      if (snap != null) notifier.applySnapshot(snap);
    });

    switch (state.phase) {
      case RtcCallPhase.idle:
        return const SizedBox.shrink();
      case RtcCallPhase.incomingRinging:
        return _IncomingCallSheet(
          state: state,
          onAccept: notifier.acceptCall,
          onDecline: notifier.rejectCall,
        );
      case RtcCallPhase.outgoingRinging:
      case RtcCallPhase.connected:
        return _ActiveCallScreen(
          state: state,
          colors: colors,
          t: t,
          connected: _connected,
          remoteConnected: _remoteConnected,
          micEnabled: _micEnabled,
          cameraEnabled: _cameraEnabled,
          screenShareEnabled: _screenShareEnabled,
          speakerEnabled: _speakerEnabled,
          localVideoTrack: _localVideoTrack,
          remoteVideoTrack: _remoteVideoTrack,
          localScreenShareTrack: _localScreenShareTrack,
          remoteScreenShareTrack: _remoteScreenShareTrack,
          onToggleMic: _toggleMic,
          onToggleCamera: _toggleCamera,
          onToggleScreenShare: _toggleScreenShare,
          onToggleSpeaker: _toggleSpeaker,
          onEnd: state.phase == RtcCallPhase.connected
              ? notifier.hangupCall
              : notifier.cancelCall,
        );
    }
  }
}

class _IncomingCallSheet extends StatelessWidget {
  final RtcCallState state;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const _IncomingCallSheet({
    required this.state,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final accepting = state.actionPending == RtcCallAction.accept;

    return Material(
      color: colors.surface.withValues(alpha: 0.98),
      child: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Avatar(
                imageUrl: state.peer?.avatarUrl,
                name: state.peer?.name ?? '?',
                radius: 44,
              ),
              const SizedBox(height: 16),
              Text(
                state.hasVideo
                    ? t.rtcIncomingVideoCallTitle
                    : t.rtcIncomingCallTitle,
                style: TextStyle(color: colors.fgMuted, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                state.peer?.name ?? '',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _CallActionButton(
                    icon: Icons.call_end,
                    color: colors.danger,
                    label: t.rtcDecline,
                    onPressed: onDecline,
                    disabled: accepting,
                  ),
                  const SizedBox(width: 32),
                  _CallActionButton(
                    icon: Icons.call,
                    color: colors.success,
                    label: accepting ? t.rtcConnectingTitle : t.rtcAccept,
                    onPressed: onAccept,
                    disabled: accepting,
                    loading: accepting,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActiveCallScreen extends StatefulWidget {
  final RtcCallState state;
  final AppColors colors;
  final AppLocalizations t;
  final bool connected;
  final bool remoteConnected;
  final bool micEnabled;
  final bool cameraEnabled;
  final bool screenShareEnabled;
  final bool speakerEnabled;
  final lk.VideoTrack? localVideoTrack;
  final lk.VideoTrack? remoteVideoTrack;
  final lk.VideoTrack? localScreenShareTrack;
  final lk.VideoTrack? remoteScreenShareTrack;
  final VoidCallback onToggleMic;
  final VoidCallback onToggleCamera;
  final VoidCallback onToggleScreenShare;
  final VoidCallback onToggleSpeaker;
  final VoidCallback onEnd;

  const _ActiveCallScreen({
    required this.state,
    required this.colors,
    required this.t,
    required this.connected,
    required this.remoteConnected,
    required this.micEnabled,
    required this.cameraEnabled,
    required this.screenShareEnabled,
    required this.speakerEnabled,
    required this.localVideoTrack,
    required this.remoteVideoTrack,
    required this.localScreenShareTrack,
    required this.remoteScreenShareTrack,
    required this.onToggleMic,
    required this.onToggleCamera,
    required this.onToggleScreenShare,
    required this.onToggleSpeaker,
    required this.onEnd,
  });

  @override
  State<_ActiveCallScreen> createState() => _ActiveCallScreenState();
}

class _ActiveCallScreenState extends State<_ActiveCallScreen> {
  Timer? _durationTimer;
  DateTime? _callStart;
  int _durationSeconds = 0;

  @override
  void didUpdateWidget(covariant _ActiveCallScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    _syncTimer();
  }

  @override
  void initState() {
    super.initState();
    _syncTimer();
  }

  void _syncTimer() {
    final isConnected = widget.state.phase == RtcCallPhase.connected;
    if (isConnected && _durationTimer == null) {
      // Seed from the server-side accept time when known (snapshot recovery
      // after a relaunch) so the readout continues instead of restarting at
      // 0:00 — same fix as the web overlay's connectedAt seeding. Clamped so
      // clock skew can't render a negative elapsed time.
      _callStart = widget.state.connectedAt ?? DateTime.now();
      _durationSeconds =
          DateTime.now().difference(_callStart!).inSeconds.clamp(0, 1 << 31);
      _durationTimer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (!mounted) return;
        setState(() {
          _durationSeconds = DateTime.now()
              .difference(_callStart!)
              .inSeconds
              .clamp(0, 1 << 31);
        });
      });
    } else if (!isConnected && _durationTimer != null) {
      _durationTimer?.cancel();
      _durationTimer = null;
      _callStart = null;
      _durationSeconds = 0;
    }
  }

  @override
  void dispose() {
    _durationTimer?.cancel();
    super.dispose();
  }

  /// Same status ladder as the web overlay: cancelling → calling → connecting
  /// → waiting for peer → running "elapsed / limit" timer.
  String _statusText() {
    final state = widget.state;
    final t = widget.t;
    if (state.phase == RtcCallPhase.outgoingRinging) {
      return state.actionPending == RtcCallAction.cancel
          ? t.rtcCancelling
          : t.rtcCallingTitle(state.peer?.name ?? '');
    }
    if (!widget.connected) return t.rtcConnectingTitle;
    if (!widget.remoteConnected) {
      return t.rtcWaitingForPeer(state.peer?.name ?? '');
    }
    return formatCallTimer(_durationSeconds, state.livekit?.maxDurationMinutes);
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.state;
    final colors = widget.colors;
    final t = widget.t;
    final isConnected = state.phase == RtcCallPhase.connected;
    final shareSource = resolveActiveCallShare(
      remoteSharing: widget.remoteScreenShareTrack != null,
      localSharing:
          widget.screenShareEnabled && widget.localScreenShareTrack != null,
    );
    final activeShareTrack = switch (shareSource) {
      CallShareSource.remote => widget.remoteScreenShareTrack,
      CallShareSource.local => widget.localScreenShareTrack,
      null => null,
    };
    final isSharing = activeShareTrack != null;
    final showShare = isConnected && state.hasVideo && isSharing;
    final showVideo = !showShare &&
        isConnected &&
        state.hasVideo &&
        widget.remoteVideoTrack != null;
    final actionPending = state.actionPending != null;

    return Material(
      color: Colors.black,
      child: SafeArea(
        child: Stack(
          children: [
            if (showShare)
              Positioned.fill(
                child: lk.VideoTrackRenderer(activeShareTrack),
              )
            else if (showVideo)
              Positioned.fill(
                child: lk.VideoTrackRenderer(widget.remoteVideoTrack!),
              )
            else
              Center(
                child: Avatar(
                  imageUrl: state.peer?.avatarUrl,
                  name: state.peer?.name ?? '?',
                  radius: 48,
                ),
              ),
            if (isConnected && state.hasVideo && widget.localVideoTrack != null)
              Positioned(
                right: 16,
                top: 16,
                child: SizedBox(
                  width: 110,
                  height: 150,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: lk.VideoTrackRenderer(widget.localVideoTrack!),
                  ),
                ),
              ),
            // Peer's camera moves into a small tile once their (or your
            // own) screen share takes the main stage above — it must not
            // just disappear behind the share.
            if (showShare && widget.remoteVideoTrack != null)
              Positioned(
                right: 16,
                top: 182,
                child: SizedBox(
                  width: 110,
                  height: 150,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: lk.VideoTrackRenderer(widget.remoteVideoTrack!),
                  ),
                ),
              ),
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Column(
                children: [
                  Text(
                    state.peer?.name ?? '',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    _statusText(),
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  if (state.warningSecondsRemaining != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        t.rtcCallLimitWarning(state.warningSecondsRemaining!),
                        style: TextStyle(color: colors.warning, fontSize: 12),
                      ),
                    ),
                ],
              ),
            ),
            Positioned(
              bottom: 32,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (isConnected) ...[
                    _CallActionButton(
                      icon: widget.micEnabled ? Icons.mic : Icons.mic_off,
                      color: Colors.white24,
                      label: widget.micEnabled ? t.rtcMute : t.rtcUnmute,
                      onPressed: widget.onToggleMic,
                    ),
                    const SizedBox(width: 20),
                    _CallActionButton(
                      icon: widget.speakerEnabled
                          ? Icons.volume_up
                          : Icons.volume_off,
                      color: Colors.white24,
                      label: widget.speakerEnabled
                          ? t.rtcSpeakerOn
                          : t.rtcSpeakerOff,
                      onPressed: widget.onToggleSpeaker,
                    ),
                    const SizedBox(width: 20),
                    if (state.hasVideo)
                      _CallActionButton(
                        icon: widget.cameraEnabled
                            ? Icons.videocam
                            : Icons.videocam_off,
                        color: Colors.white24,
                        label: widget.cameraEnabled
                            ? t.rtcCameraOff
                            : t.rtcCameraOn,
                        onPressed: widget.onToggleCamera,
                      ),
                    if (state.hasVideo) const SizedBox(width: 20),
                    if (state.hasVideo)
                      _CallActionButton(
                        icon: widget.screenShareEnabled
                            ? Icons.stop_screen_share
                            : Icons.screen_share,
                        color: Colors.white24,
                        label: widget.screenShareEnabled
                            ? t.rtcScreenShareOff
                            : t.rtcScreenShareOn,
                        onPressed: widget.onToggleScreenShare,
                      ),
                    const SizedBox(width: 20),
                  ],
                  _CallActionButton(
                    icon: Icons.call_end,
                    color: colors.danger,
                    label: isConnected ? t.rtcHangup : t.rtcCancel,
                    onPressed: widget.onEnd,
                    disabled: actionPending,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CallActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final VoidCallback onPressed;
  final bool disabled;
  final bool loading;

  const _CallActionButton({
    required this.icon,
    required this.color,
    required this.label,
    required this.onPressed,
    this.disabled = false,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: label,
      child: InkWell(
        onTap: disabled ? null : onPressed,
        customBorder: const CircleBorder(),
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: disabled ? color.withValues(alpha: 0.4) : color,
            shape: BoxShape.circle,
          ),
          child: loading
              ? const Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  ),
                )
              : Icon(icon, color: Colors.white),
        ),
      ),
    );
  }
}
