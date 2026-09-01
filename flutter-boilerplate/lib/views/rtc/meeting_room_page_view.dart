import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart'
    show RealtimeStatus;
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/meeting_signal.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_telemetry.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:livekit_client/livekit_client.dart' as lk;
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../api/client/friends/query.dart';
import '../../api/client/rtc/meetings_actions.dart';
import '../../api/client/rtc/meetings_chat_live.dart';
import '../../api/server/rtc/meetings_recording.dart';
import '../../app_config.dart';
import '../../components/rtc/rtc_chat_panel.dart';
import '../../components/rtc/rtc_report_dialog.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/meeting.dart';
import '../../types/rtc/recording.dart';

enum RoomPhase { joining, active, ended, removed, notFound, joinFailed }

/// Pure mapper for a failed join: 404 means the meeting is gone or already
/// over (the not-found copy covers both); any other status is a join
/// failure — never "the meeting has ended", which used to mask real server
/// errors as a normal end. Same split the web view makes.
RoomPhase roomPhaseForJoinFailure(int? statusCode) =>
    statusCode == 404 ? RoomPhase.notFound : RoomPhase.joinFailed;

/// Screen copy shown in place of the room for each non-active phase.
String roomPhaseMessage(RoomPhase phase, AppLocalizations t) => switch (phase) {
      RoomPhase.notFound => t.rtcMeetingNotFound,
      RoomPhase.removed => t.rtcMeetingRemovedNotice,
      RoomPhase.joinFailed => t.rtcJoinMeetingFailed,
      _ => t.rtcMeetingEndedNotice,
    };

/// Public (not `_`-prefixed) so `buildMeetingStageTiles` is unit-testable
/// without pumping the whole widget tree — same reasoning as
/// `roomPhaseForJoinFailure` above.
@visibleForTesting
class MeetingParticipantView {
  final String identity;
  final String name;
  final bool isLocal;
  final lk.VideoTrack? videoTrack;
  final lk.VideoTrack? screenShareTrack;
  final bool micEnabled;
  final bool cameraEnabled;
  final bool screenShareEnabled;

  const MeetingParticipantView({
    required this.identity,
    required this.name,
    required this.isLocal,
    this.videoTrack,
    this.screenShareTrack,
    required this.micEnabled,
    required this.cameraEnabled,
    required this.screenShareEnabled,
  });
}

@visibleForTesting
enum MeetingStageVideoMode { camera, screen }

/// One tile on the meeting grid. Each participant contributes a camera
/// tile, plus a second screen-share tile while they're presenting — the
/// two render independently so a presenter's face never disappears behind
/// their own shared screen (the grid used to hold one tile per participant
/// and picked screenShareTrack over videoTrack whenever both existed).
@visibleForTesting
class MeetingStageTile {
  final String key;
  final MeetingParticipantView participant;
  final MeetingStageVideoMode mode;

  const MeetingStageTile({
    required this.key,
    required this.participant,
    required this.mode,
  });
}

@visibleForTesting
List<MeetingStageTile> buildMeetingStageTiles(
  List<MeetingParticipantView> participants,
) {
  final tiles = <MeetingStageTile>[];
  for (final p in participants) {
    if (p.screenShareTrack != null) {
      tiles.add(
        MeetingStageTile(
          key: '${p.identity}::screen',
          participant: p,
          mode: MeetingStageVideoMode.screen,
        ),
      );
    }
    tiles.add(
      MeetingStageTile(
        key: p.identity,
        participant: p,
        mode: MeetingStageVideoMode.camera,
      ),
    );
  }
  return tiles;
}

/// Group-meeting room — an N-participant analog of RtcCallOverlay's LiveKit
/// connect/toggle logic, but page-scoped (a dedicated route, not a global
/// overlay) since a meeting has no "answer from any screen" requirement the
/// way a 1:1 call does. Owns the Room instance directly for the same reason
/// the call overlay does: the connection lifecycle is 1:1 with this widget's
/// mount lifetime.
class RtcMeetingRoomPageContent extends ConsumerStatefulWidget {
  final String lang;
  final String slug;

  const RtcMeetingRoomPageContent({
    super.key,
    required this.lang,
    required this.slug,
  });

  @override
  ConsumerState<RtcMeetingRoomPageContent> createState() =>
      _RtcMeetingRoomPageContentState();
}

class _RtcMeetingRoomPageContentState
    extends ConsumerState<RtcMeetingRoomPageContent> {
  lk.Room? _room;
  lk.EventsListener<lk.RoomEvent>? _listener;
  List<MeetingParticipantView> _participants = [];
  bool _localMicEnabled = true;
  bool _localCameraEnabled = true;
  bool _localScreenShareEnabled = false;

  RoomPhase _phase = RoomPhase.joining;
  JoinMeetingResult? _join;
  bool _sentJoinChat = false;
  int _lastHandledSignalSeq = 0;
  int _tab = 0;
  final _chatController = TextEditingController();
  RtcRecording? _recording;
  bool _recordingBusy = false;

  @override
  void initState() {
    super.initState();
    // Keep the screen awake while in the meeting — the Flutter twin of the
    // web's Wake Lock fix (without it the display times out mid-meeting).
    unawaited(WakelockPlus.enable());
    _joinMeeting();
  }

  Future<void> _joinMeeting() async {
    try {
      final result = await ref.read(meetingActionsProvider).join(widget.slug);
      if (!mounted) return;
      setState(() {
        _join = result;
        _phase = RoomPhase.active;
      });
      ref
          .read(realtimeProvider)
          .send({'type': 'rtc:join-room-chat', 'slug': widget.slug});
      _sentJoinChat = true;
      if (result.role == 'HOST') unawaited(_fetchRecording());
      await _connectRoom(result.token, result.roomName);
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'meeting.join_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'joining',
      );
      if (!mounted) return;
      final status = error is DioException ? error.response?.statusCode : null;
      setState(() => _phase = roomPhaseForJoinFailure(status));
      final message =
          error is DioException && (error.message?.isNotEmpty ?? false)
              ? error.message!
              : AppLocalizations.of(context).rtcJoinMeetingFailed;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  /// Seeds the host's recording control with the meeting's current
  /// recording, so re-entering an ongoing meeting doesn't show "Start
  /// recording" while one is already running — the web view keeps this
  /// fresh with a query; a one-shot fetch on join covers the same gap here.
  Future<void> _fetchRecording() async {
    try {
      final current =
          await ref.read(meetingRecordingServerProvider).get(widget.slug);
      if (mounted && current != null) setState(() => _recording = current);
    } catch (error) {
      logRtcEvent(
        event: 'meeting.recording_fetch_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        phase: 'joining',
      );
    }
  }

  Future<void> _connectRoom(String token, String roomName) async {
    final room = lk.Room();
    _room = room;
    final listener = room.createListener();
    _listener = listener;

    logRtcEvent(
      event: 'meeting.livekit.connecting',
      rtcKind: 'meeting',
      rtcId: widget.slug,
      roomName: roomName,
      phase: 'connecting',
    );

    listener
      ..on<lk.ParticipantConnectedEvent>((_) => _rebuildParticipants())
      ..on<lk.ParticipantDisconnectedEvent>((_) => _rebuildParticipants())
      ..on<lk.TrackSubscribedEvent>((_) => _rebuildParticipants())
      ..on<lk.TrackUnsubscribedEvent>((_) => _rebuildParticipants())
      ..on<lk.TrackMutedEvent>((_) => _rebuildParticipants())
      ..on<lk.TrackUnmutedEvent>((_) => _rebuildParticipants())
      ..on<lk.LocalTrackPublishedEvent>((_) => _rebuildParticipants())
      ..on<lk.LocalTrackUnpublishedEvent>((_) => _rebuildParticipants())
      ..on<lk.RoomReconnectingEvent>((_) {
        logRtcEvent(
          event: 'meeting.livekit.reconnecting',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          roomName: roomName,
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
        );
      })
      ..on<lk.RoomReconnectedEvent>((_) {
        logRtcEvent(
          event: 'meeting.livekit.reconnected',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          roomName: roomName,
          phase: 'connected',
        );
        _rebuildParticipants();
      })
      ..on<lk.RoomDisconnectedEvent>((event) {
        logRtcEvent(
          event: 'meeting.livekit.disconnected',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          roomName: roomName,
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
          metadata: {'reason': event.reason?.name},
        );
        // clientInitiated means our own _teardownRoom() called disconnect()
        // — already an intentional exit. Any other reason is an involuntary
        // death (LiveKit's own reconnect gave up) nothing else would ever
        // recover from client-side — without this, the participant grid
        // just sits frozen with no video/audio and no indication anything
        // is wrong. Treat it the same as the user tapping Leave.
        if (mounted &&
            event.reason != null &&
            event.reason != lk.DisconnectReason.clientInitiated) {
          _leave();
        }
      })
      ..on<lk.ParticipantConnectionQualityUpdatedEvent>((event) {
        if (event.connectionQuality == lk.ConnectionQuality.poor) {
          logRtcEvent(
            event: 'meeting.livekit.connection_quality_poor',
            rtcKind: 'meeting',
            rtcId: widget.slug,
            roomName: roomName,
            exceptionType: 'CLIENT_ERROR',
            phase: 'connected',
            metadata: {'participantId': event.participant.identity},
          );
        }
      });

    try {
      await room.connect(AppConfig.livekitUrl, token);
      if (!mounted || _room != room) {
        await room.disconnect();
        return;
      }
      logRtcEvent(
        event: 'meeting.livekit.connected',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        roomName: roomName,
        phase: 'connected',
      );
      try {
        await room.localParticipant?.setMicrophoneEnabled(true);
      } catch (error, stackTrace) {
        logRtcEvent(
          event: 'meeting.media.microphone_enable_failed',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          roomName: roomName,
          mediaType: 'audio',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
      }
      try {
        await room.localParticipant?.setCameraEnabled(true);
      } catch (error, stackTrace) {
        logRtcEvent(
          event: 'meeting.media.camera_enable_failed',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          roomName: roomName,
          mediaType: 'video',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
      }
      _rebuildParticipants();
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'meeting.livekit.connection_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        roomName: roomName,
        exceptionType: 'CLIENT_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'connecting',
      );
      // Connection failed — the room UI's own leave control lets the user
      // bail out.
    }
  }

  void _rebuildParticipants() {
    final room = _room;
    if (!mounted || room == null) return;
    final all = <lk.Participant>[
      if (room.localParticipant != null) room.localParticipant!,
      ...room.remoteParticipants.values,
    ];
    setState(() {
      _participants = all.map(_toView).toList();
    });
  }

  MeetingParticipantView _toView(lk.Participant p) {
    lk.VideoTrack? findVideo(lk.TrackSource source) {
      for (final pub in p.videoTrackPublications) {
        if (pub.source == source && pub.track is lk.VideoTrack) {
          return pub.track as lk.VideoTrack;
        }
      }
      return null;
    }

    return MeetingParticipantView(
      identity: p.identity,
      name: p.name.isNotEmpty ? p.name : p.identity,
      isLocal: p is lk.LocalParticipant,
      videoTrack: findVideo(lk.TrackSource.camera),
      screenShareTrack: findVideo(lk.TrackSource.screenShareVideo),
      micEnabled: p.isMicrophoneEnabled(),
      cameraEnabled: p.isCameraEnabled(),
      screenShareEnabled: p.isScreenShareEnabled(),
    );
  }

  Future<void> _teardownRoom() async {
    final listener = _listener;
    final room = _room;
    _listener = null;
    _room = null;
    await listener?.dispose();
    await room?.disconnect();
  }

  void _toggleMic() {
    final room = _room;
    if (room == null) return;
    final next = !_localMicEnabled;
    setState(() => _localMicEnabled = next);
    room.localParticipant?.setMicrophoneEnabled(next).then<void>(
      (_) => _rebuildParticipants(),
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'meeting.media.microphone_toggle_failed',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          mediaType: 'audio',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
        // Revert the optimistic toggle rather than leaving the icon showing
        // the opposite of actual state, matching _toggleScreenShare below.
        if (mounted) setState(() => _localMicEnabled = !next);
      },
    );
  }

  void _toggleCamera() {
    final room = _room;
    if (room == null) return;
    final next = !_localCameraEnabled;
    setState(() => _localCameraEnabled = next);
    room.localParticipant?.setCameraEnabled(next).then<void>(
      (_) => _rebuildParticipants(),
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'meeting.media.camera_toggle_failed',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          mediaType: 'video',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
        // Revert the optimistic toggle rather than leaving the icon showing
        // the opposite of actual state, matching _toggleScreenShare below.
        if (mounted) setState(() => _localCameraEnabled = !next);
      },
    );
  }

  void _toggleScreenShare() {
    final room = _room;
    if (room == null) return;
    final next = !_localScreenShareEnabled;
    setState(() => _localScreenShareEnabled = next);
    room.localParticipant?.setScreenShareEnabled(next).then<void>(
      (_) => _rebuildParticipants(),
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'meeting.media.screen_share_failed',
          rtcKind: 'meeting',
          rtcId: widget.slug,
          mediaType: 'screen',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
        if (mounted) setState(() => _localScreenShareEnabled = false);
      },
    );
  }

  void _sendChat() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;
    ref.read(realtimeProvider).send({
      'type': 'rtc:chat-message',
      'slug': widget.slug,
      'text': text,
    });
    _chatController.clear();
  }

  void _leave() {
    // Fire-and-forget like the web's handleLeave: navigation must not hang
    // on the REST call — if the network just died (the common reason the
    // LiveKit room dropped), awaiting it left the user stuck on a frozen
    // grid with a Leave button that did nothing visible.
    ref
        .read(meetingActionsProvider)
        .leave(widget.slug)
        .catchError((Object error) {
      logRtcEvent(
        event: 'meeting.leave_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        phase: 'active',
      );
    });
    if (mounted) context.go('/v1/${widget.lang}/rtc/meetings');
  }

  Future<void> _end() async {
    final t = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.rtcEndMeeting),
        content: Text(t.rtcEndMeetingConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(t.rtcCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(t.rtcEndMeeting),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ref.read(meetingActionsProvider).end(widget.slug);
      if (mounted) context.go('/v1/${widget.lang}/rtc/meetings');
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'meeting.end_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'active',
      );
      if (mounted) {
        final message =
            error is DioException && (error.message?.isNotEmpty ?? false)
                ? error.message!
                : t.rtcEndMeetingFailed;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
      }
    }
  }

  Future<void> _invite() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => _InviteFriendsSheet(slug: widget.slug),
    );
  }

  Future<void> _report() async {
    await showDialog<void>(
      context: context,
      builder: (context) => RtcReportDialog(
        onSubmit: (reason, details) async {
          try {
            await ref
                .read(meetingActionsProvider)
                .report(widget.slug, reason, details: details);
          } catch (error) {
            logRtcEvent(
              event: 'meeting.report_failed',
              rtcKind: 'meeting',
              rtcId: widget.slug,
              exceptionType: 'CLIENT_REQUEST_ERROR',
              error: error,
              metadata: {'reason': reason},
            );
            rethrow;
          }
        },
      ),
    );
  }

  Future<void> _toggleRecording() async {
    setState(() => _recordingBusy = true);
    try {
      final actions = ref.read(meetingActionsProvider);
      final next = _recording?.status == 'RECORDING'
          ? await actions.stopRecording(widget.slug)
          : await actions.startRecording(widget.slug);
      if (mounted) setState(() => _recording = next);
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'meeting.recording_toggle_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'active',
      );
      if (mounted) {
        final message =
            error is DioException && (error.message?.isNotEmpty ?? false)
                ? error.message!
                : error.toString();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
      }
    } finally {
      if (mounted) setState(() => _recordingBusy = false);
    }
  }

  @override
  void dispose() {
    unawaited(WakelockPlus.disable());
    if (_sentJoinChat) {
      ref
          .read(realtimeProvider)
          .send({'type': 'rtc:leave-room-chat', 'slug': widget.slug});
    }
    ref
        .read(meetingActionsProvider)
        .leave(widget.slug)
        .catchError((Object error) {
      logRtcEvent(
        event: 'meeting.leave_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        phase: 'dispose',
      );
    });
    _teardownRoom();
    _chatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final stageTiles = buildMeetingStageTiles(_participants);

    ref.listen<MeetingSignal>(meetingSignalProvider(widget.slug), (
      prev,
      next,
    ) {
      if (next.seq == _lastHandledSignalSeq) return;
      _lastHandledSignalSeq = next.seq;
      if (next.ended) {
        setState(() => _phase = RoomPhase.ended);
        // The LiveKit Room (incl. the local participant's camera/mic) was
        // only ever torn down from dispose() — a remote end/removal left it
        // connected indefinitely until the user happened to navigate away.
        _teardownRoom();
        unawaited(WakelockPlus.disable());
      } else if (next.removed) {
        setState(() => _phase = RoomPhase.removed);
        _teardownRoom();
        unawaited(WakelockPlus.disable());
      } else if (next.forceMuted && _localMicEnabled) {
        _toggleMic();
      } else if (next.warningSecondsRemaining != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              t.rtcMeetingLimitWarning(next.warningSecondsRemaining!),
            ),
          ),
        );
      } else if (next.joinedName != null) {
        final name =
            next.joinedName!.isNotEmpty ? next.joinedName! : t.rtcSomeone;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(t.rtcParticipantJoined(name))),
        );
      }
    });

    // Chat-room membership (and every meeting lifecycle push that rides on
    // it: chat, ended/removed, force-mute, limit warnings) is per-WS-
    // connection server-side — a reconnect silently drops it. Re-join and
    // refetch the chat backlog whenever the socket comes back, the way the
    // web view's [realtimeStatus] effect + resync invalidation do.
    ref.listen<RealtimeStatus>(realtimeStatusProvider, (prev, next) {
      if (next == RealtimeStatus.open &&
          prev != RealtimeStatus.open &&
          _phase == RoomPhase.active &&
          _sentJoinChat) {
        ref
            .read(realtimeProvider)
            .send({'type': 'rtc:join-room-chat', 'slug': widget.slug});
        ref.invalidate(meetingChatProvider(widget.slug));
      }
    });

    if (_phase == RoomPhase.joining) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 12),
              Text(t.rtcJoiningMeeting),
            ],
          ),
        ),
      );
    }

    if (_phase != RoomPhase.active) {
      final message = roomPhaseMessage(_phase, t);
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(message),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => context.go('/v1/${widget.lang}/rtc/meetings'),
                child: Text(t.rtcBackToMeetings),
              ),
            ],
          ),
        ),
      );
    }

    final isHost = _join?.role == 'HOST';

    return Scaffold(
      appBar: AppBar(
        title: Text(_join?.meeting.title ?? ''),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt),
            tooltip: t.rtcInviteToMeeting,
            onPressed: _invite,
          ),
          IconButton(
            icon: const Icon(Icons.flag_outlined),
            tooltip: t.rtcReportTitle,
            onPressed: _report,
          ),
          IconButton(
            icon: Icon(isHost ? Icons.call_end : Icons.logout),
            tooltip: isHost ? t.rtcEndMeeting : t.rtcLeaveMeeting,
            onPressed: isHost ? _end : _leave,
          ),
        ],
      ),
      body: Column(
        children: [
          if (isHost)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: Row(
                children: [
                  TextButton.icon(
                    onPressed: _recordingBusy ? null : _toggleRecording,
                    icon: Icon(
                      _recording?.status == 'RECORDING'
                          ? Icons.stop_circle
                          : Icons.fiber_manual_record,
                      color: _recording?.status == 'RECORDING'
                          ? colors.danger
                          : null,
                    ),
                    label: Text(
                      _recording?.status == 'RECORDING'
                          ? t.rtcStopRecording
                          : t.rtcStartRecording,
                    ),
                  ),
                  if (_recording?.status == 'RECORDING')
                    Expanded(
                      child: Text(
                        t.rtcRecordingComingSoonNote,
                        style: Theme.of(context).textTheme.bodySmall,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
              ),
            ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(8),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 4 / 3,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: stageTiles.length,
              itemBuilder: (context, index) {
                final tile = stageTiles[index];
                return _ParticipantTile(
                  key: ValueKey(tile.key),
                  participant: tile.participant,
                  mode: tile.mode,
                  t: t,
                );
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: Icon(_localMicEnabled ? Icons.mic : Icons.mic_off),
                onPressed: _toggleMic,
              ),
              IconButton(
                icon: Icon(
                  _localCameraEnabled ? Icons.videocam : Icons.videocam_off,
                ),
                onPressed: _toggleCamera,
              ),
              IconButton(
                icon: Icon(
                  _localScreenShareEnabled
                      ? Icons.stop_screen_share
                      : Icons.screen_share,
                ),
                onPressed: _toggleScreenShare,
              ),
            ],
          ),
          SizedBox(
            height: 260,
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor:
                              _tab == 0 ? colors.surfaceHover : null,
                        ),
                        onPressed: () => setState(() => _tab = 0),
                        child: Text(t.rtcChatTitle),
                      ),
                    ),
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor:
                              _tab == 1 ? colors.surfaceHover : null,
                        ),
                        onPressed: () => setState(() => _tab = 1),
                        child: Text(
                          '${t.rtcParticipantsTitle} (${_participants.length})',
                        ),
                      ),
                    ),
                  ],
                ),
                Expanded(
                  child: _tab == 0
                      ? _ChatPanel(
                          slug: widget.slug,
                          controller: _chatController,
                          onSend: _sendChat,
                        )
                      : _ParticipantsPanel(
                          participants: _participants,
                          isHost: isHost,
                          slug: widget.slug,
                          t: t,
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ParticipantTile extends StatelessWidget {
  final MeetingParticipantView participant;
  final MeetingStageVideoMode mode;
  final AppLocalizations t;

  const _ParticipantTile({
    super.key,
    required this.participant,
    this.mode = MeetingStageVideoMode.camera,
    required this.t,
  });

  @override
  Widget build(BuildContext context) {
    final isScreenShare = mode == MeetingStageVideoMode.screen;
    // Camera tiles only ever show the camera track — a presenter's own
    // face used to disappear behind their shared screen because this tile
    // fell back to screenShareTrack whenever one was live. Screen-share
    // tiles are now a separate tile the grid renders alongside the camera
    // tile, so both show up at once (Meet-style) instead of one hiding
    // the other.
    final track =
        isScreenShare ? participant.screenShareTrack : participant.videoTrack;
    final showVideo = isScreenShare
        ? participant.screenShareTrack != null
        : (participant.videoTrack != null && participant.cameraEnabled);
    final label = isScreenShare
        ? (participant.isLocal
            ? t.rtcYourScreenLabel
            : t.rtcParticipantScreenLabel(participant.name))
        : (participant.isLocal ? t.rtcYouLabel : participant.name);

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Container(
        color: Colors.black87,
        child: Stack(
          children: [
            if (showVideo && track != null)
              Positioned.fill(child: lk.VideoTrackRenderer(track))
            else
              Center(child: Avatar(name: participant.name, radius: 28)),
            Positioned(
              left: 6,
              right: 6,
              bottom: 6,
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      label,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (isScreenShare)
                    const Padding(
                      padding: EdgeInsets.only(right: 4),
                      child: Icon(
                        Icons.screen_share,
                        color: Colors.white,
                        size: 14,
                      ),
                    ),
                  if (!isScreenShare && !participant.micEnabled)
                    const Icon(Icons.mic_off, color: Colors.white, size: 14),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatPanel extends ConsumerWidget {
  final String slug;
  final TextEditingController controller;
  final VoidCallback onSend;

  const _ChatPanel({
    required this.slug,
    required this.controller,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final PaginatedListState<MeetingChatMessage> state = ref.watch(
      meetingChatProvider(slug),
    );

    return RtcChatPanel(
      messages: [
        for (final m in state.items) (senderName: m.senderName, text: m.text),
      ],
      controller: controller,
      onSend: onSend,
    );
  }
}

class _ParticipantsPanel extends ConsumerWidget {
  final List<MeetingParticipantView> participants;
  final bool isHost;
  final String slug;
  final AppLocalizations t;

  const _ParticipantsPanel({
    required this.participants,
    required this.isHost,
    required this.slug,
    required this.t,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView.builder(
      itemCount: participants.length,
      itemBuilder: (context, index) {
        final p = participants[index];
        return ListTile(
          leading: Avatar(name: p.name, radius: 16),
          title: Text(p.isLocal ? t.rtcYouLabel : p.name),
          trailing: isHost && !p.isLocal
              ? Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.mic_off, size: 18),
                      tooltip: t.rtcMuteParticipant,
                      onPressed: () {
                        ref
                            .read(meetingActionsProvider)
                            .muteParticipant(slug, p.identity, true)
                            .catchError((Object error) {
                          logRtcEvent(
                            event: 'meeting.participant_mute_failed',
                            rtcKind: 'meeting',
                            rtcId: slug,
                            exceptionType: 'CLIENT_REQUEST_ERROR',
                            error: error,
                            metadata: {'participantId': p.identity},
                          );
                        });
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.person_remove, size: 18),
                      tooltip: t.rtcRemoveParticipant,
                      onPressed: () {
                        ref
                            .read(meetingActionsProvider)
                            .removeParticipant(slug, p.identity)
                            .catchError((Object error) {
                          logRtcEvent(
                            event: 'meeting.participant_remove_failed',
                            rtcKind: 'meeting',
                            rtcId: slug,
                            exceptionType: 'CLIENT_REQUEST_ERROR',
                            error: error,
                            metadata: {'participantId': p.identity},
                          );
                        });
                      },
                    ),
                  ],
                )
              : null,
        );
      },
    );
  }
}

/// Friend picker for "invite to meeting" — reuses the existing friends list
/// (server-side enforces the target actually is a friend).
class _InviteFriendsSheet extends ConsumerStatefulWidget {
  final String slug;

  const _InviteFriendsSheet({required this.slug});

  @override
  ConsumerState<_InviteFriendsSheet> createState() =>
      _InviteFriendsSheetState();
}

class _InviteFriendsSheetState extends ConsumerState<_InviteFriendsSheet> {
  final Set<String> _invitedIds = {};

  Future<void> _invite(String userId) async {
    try {
      await ref.read(meetingActionsProvider).invite(widget.slug, userId);
      if (mounted) setState(() => _invitedIds.add(userId));
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'meeting.invite_failed',
        rtcKind: 'meeting',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        stackTrace: stackTrace,
        metadata: {'participantId': userId},
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final friendsAsync = ref.watch(friendsListProvider);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              t.rtcInviteToMeeting,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            friendsAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(),
              ),
              error: (err, stack) => Text(t.rtcNoFriendsToInvite),
              data: (friends) => friends.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(t.rtcNoFriendsToInvite),
                    )
                  : ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 320),
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: friends.length,
                        itemBuilder: (context, index) {
                          final friend = friends[index];
                          final invited = _invitedIds.contains(friend.id);
                          return ListTile(
                            leading: Avatar(name: friend.name, radius: 16),
                            title: Text(friend.name),
                            trailing: TextButton(
                              onPressed:
                                  invited ? null : () => _invite(friend.id),
                              child: Text(invited ? t.rtcInvited : t.rtcInvite),
                            ),
                          );
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
