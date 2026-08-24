import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:livekit_client/livekit_client.dart' as lk;

import '../../api/client/rtc/query.dart';
import '../../app_config.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/active_call_snapshot.dart';
import '../ui/avatar/avatar.dart';

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
  bool _connected = false;
  bool _remoteConnected = false;
  bool _micEnabled = true;
  bool _cameraEnabled = true;

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
        _connected = false;
        _remoteConnected = false;
        _micEnabled = true;
        _cameraEnabled = true;
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

    listener
      ..on<lk.TrackSubscribedEvent>((event) {
        if (event.track is lk.VideoTrack && mounted) {
          setState(() => _remoteVideoTrack = event.track as lk.VideoTrack);
        }
      })
      ..on<lk.TrackUnsubscribedEvent>((event) {
        if (identical(event.track, _remoteVideoTrack) && mounted) {
          setState(() => _remoteVideoTrack = null);
        }
      })
      ..on<lk.ParticipantConnectedEvent>((_) {
        if (mounted) setState(() => _remoteConnected = true);
      })
      ..on<lk.ParticipantDisconnectedEvent>((_) {
        if (mounted) setState(() => _remoteConnected = false);
      })
      ..on<lk.RoomDisconnectedEvent>((_) {
        if (mounted) setState(() => _connected = false);
      });

    try {
      await room.connect(AppConfig.livekitUrl, livekit.token);
      if (!mounted || _room != room) {
        await room.disconnect();
        return;
      }
      setState(() {
        _connected = true;
        _remoteConnected = room.remoteParticipants.isNotEmpty;
      });
      await room.localParticipant?.setMicrophoneEnabled(true);
      if (state.hasVideo) {
        final pub = await room.localParticipant?.setCameraEnabled(true);
        final track = pub?.track;
        if (mounted && track is lk.VideoTrack) {
          final videoTrack = track as lk.VideoTrack;
          setState(() => _localVideoTrack = videoTrack);
        }
      } else if (mounted) {
        setState(() => _cameraEnabled = false);
      }
    } catch (_) {
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
    room.localParticipant?.setMicrophoneEnabled(next);
  }

  void _toggleCamera() {
    final room = _room;
    if (room == null) return;
    final next = !_cameraEnabled;
    setState(() => _cameraEnabled = next);
    room.localParticipant?.setCameraEnabled(next).then((pub) {
      final track = pub?.track;
      if (next && mounted && track is lk.VideoTrack) {
        final videoTrack = track as lk.VideoTrack;
        setState(() => _localVideoTrack = videoTrack);
      }
    });
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
          localVideoTrack: _localVideoTrack,
          remoteVideoTrack: _remoteVideoTrack,
          onToggleMic: _toggleMic,
          onToggleCamera: _toggleCamera,
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
                  ),
                  const SizedBox(width: 32),
                  _CallActionButton(
                    icon: Icons.call,
                    color: colors.success,
                    label: t.rtcAccept,
                    onPressed: onAccept,
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

class _ActiveCallScreen extends StatelessWidget {
  final RtcCallState state;
  final AppColors colors;
  final AppLocalizations t;
  final bool connected;
  final bool remoteConnected;
  final bool micEnabled;
  final bool cameraEnabled;
  final lk.VideoTrack? localVideoTrack;
  final lk.VideoTrack? remoteVideoTrack;
  final VoidCallback onToggleMic;
  final VoidCallback onToggleCamera;
  final VoidCallback onEnd;

  const _ActiveCallScreen({
    required this.state,
    required this.colors,
    required this.t,
    required this.connected,
    required this.remoteConnected,
    required this.micEnabled,
    required this.cameraEnabled,
    required this.localVideoTrack,
    required this.remoteVideoTrack,
    required this.onToggleMic,
    required this.onToggleCamera,
    required this.onEnd,
  });

  @override
  Widget build(BuildContext context) {
    final isConnected = state.phase == RtcCallPhase.connected;
    final showVideo = isConnected && state.hasVideo && remoteVideoTrack != null;

    return Material(
      color: Colors.black,
      child: SafeArea(
        child: Stack(
          children: [
            if (showVideo)
              Positioned.fill(
                child: lk.VideoTrackRenderer(remoteVideoTrack!),
              )
            else
              Center(
                child: Avatar(
                  imageUrl: state.peer?.avatarUrl,
                  name: state.peer?.name ?? '?',
                  radius: 48,
                ),
              ),
            if (isConnected && state.hasVideo && localVideoTrack != null)
              Positioned(
                right: 16,
                top: 16,
                child: SizedBox(
                  width: 110,
                  height: 150,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: lk.VideoTrackRenderer(localVideoTrack!),
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
                    state.phase == RtcCallPhase.outgoingRinging
                        ? t.rtcCallingTitle(state.peer?.name ?? '')
                        : (!connected ? t.rtcConnectingTitle : ''),
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
                      icon: micEnabled ? Icons.mic : Icons.mic_off,
                      color: Colors.white24,
                      label: micEnabled ? t.rtcMute : t.rtcUnmute,
                      onPressed: onToggleMic,
                    ),
                    const SizedBox(width: 20),
                    if (state.hasVideo)
                      _CallActionButton(
                        icon:
                            cameraEnabled ? Icons.videocam : Icons.videocam_off,
                        color: Colors.white24,
                        label: cameraEnabled ? t.rtcCameraOff : t.rtcCameraOn,
                        onPressed: onToggleCamera,
                      ),
                    const SizedBox(width: 20),
                  ],
                  _CallActionButton(
                    icon: Icons.call_end,
                    color: colors.danger,
                    label: isConnected ? t.rtcHangup : t.rtcCancel,
                    onPressed: onEnd,
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

  const _CallActionButton({
    required this.icon,
    required this.color,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: label,
      child: InkWell(
        onTap: onPressed,
        customBorder: const CircleBorder(),
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          child: Icon(icon, color: Colors.white),
        ),
      ),
    );
  }
}
