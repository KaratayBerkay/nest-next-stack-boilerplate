import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart'
    show RealtimeStatus;
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/livekit_url.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_telemetry.dart';
import 'package:flutter_boilerplate/lib/rtc/stream_signal.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:livekit_client/livekit_client.dart' as lk;
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../api/client/rtc/streams_actions.dart';
import '../../api/client/rtc/streams_chat_live.dart';
import '../../components/rtc/rtc_chat_panel.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/recording.dart';
import '../../types/rtc/stream.dart';

/// The broadcaster's own single-page flow (setup form → live), mirroring
/// the plan's split between a dedicated go-live page and a viewer-only
/// [RtcLiveViewerPageContent] — unlike meetings there's no shared room
/// widget for both roles, since a stream's two sides genuinely differ (one
/// publisher token, many subscriber tokens).
class RtcGoLivePageContent extends ConsumerWidget {
  final String lang;

  const RtcGoLivePageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    return TierGate(
      allowedTiers: const [Tier.medium, Tier.premium],
      freeWidget: _RtcGoLiveForm(lang: lang, t: t),
    );
  }
}

class _RtcGoLiveForm extends ConsumerStatefulWidget {
  final String lang;
  final AppLocalizations t;

  const _RtcGoLiveForm({required this.lang, required this.t});

  @override
  ConsumerState<_RtcGoLiveForm> createState() => _RtcGoLiveFormState();
}

class _RtcGoLiveFormState extends ConsumerState<_RtcGoLiveForm> {
  final _titleController = TextEditingController();
  final _chatController = TextEditingController();
  bool _starting = false;
  LiveStreamJoinResult? _live;
  int _viewerCount = 0;
  bool _sentJoinChat = false;
  int _lastHandledSignalSeq = 0;

  lk.Room? _room;
  lk.EventsListener<lk.RoomEvent>? _listener;
  lk.VideoTrack? _videoTrack;
  bool _localMicEnabled = true;
  bool _localCameraEnabled = true;
  bool _localScreenShareEnabled = false;
  RtcRecording? _recording;
  bool _recordingBusy = false;

  Future<void> _goLive() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;
    setState(() => _starting = true);
    try {
      final result = await ref.read(streamActionsProvider).goLive(title);
      if (!mounted) return;
      setState(() {
        _live = result;
        _viewerCount = result.stream.viewerCount;
      });
      // Keep the screen awake while broadcasting — the Flutter twin of the
      // web's Wake Lock fix (without it the display times out mid-stream).
      unawaited(WakelockPlus.enable());
      ref.read(realtimeProvider).send({
        'type': 'rtc:join-room-chat',
        'slug': result.stream.slug,
      });
      _sentJoinChat = true;
      await _connectRoom(
        result.token,
        result.roomName,
        result.stream.slug,
        result.livekitUrl,
      );
    } catch (e, stackTrace) {
      logRtcEvent(
        event: 'stream.start_failed',
        rtcKind: 'stream',
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: e,
        stackTrace: stackTrace,
        phase: 'starting',
      );
      if (mounted) {
        final message = e is DioException && (e.message?.isNotEmpty ?? false)
            ? e.message!
            : widget.t.rtcGoLiveFailed;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(message)));
      }
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  Future<void> _connectRoom(
    String token,
    String roomName,
    String streamId,
    String? livekitUrl,
  ) async {
    final room = lk.Room();
    _room = room;
    final listener = room.createListener();
    _listener = listener;

    logRtcEvent(
      event: 'stream.livekit.connecting',
      rtcKind: 'stream',
      rtcId: streamId,
      roomName: roomName,
      phase: 'connecting',
      metadata: {'role': 'broadcaster'},
    );

    listener
      ..on<lk.LocalTrackPublishedEvent>((_) => _rebuildLocalVideo())
      ..on<lk.LocalTrackUnpublishedEvent>((_) => _rebuildLocalVideo())
      ..on<lk.RoomReconnectingEvent>((_) {
        logRtcEvent(
          event: 'stream.livekit.reconnecting',
          rtcKind: 'stream',
          rtcId: streamId,
          roomName: roomName,
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
          metadata: {'role': 'broadcaster'},
        );
      })
      ..on<lk.RoomReconnectedEvent>((_) {
        logRtcEvent(
          event: 'stream.livekit.reconnected',
          rtcKind: 'stream',
          rtcId: streamId,
          roomName: roomName,
          phase: 'connected',
          metadata: {'role': 'broadcaster'},
        );
        _rebuildLocalVideo();
      })
      ..on<lk.RoomDisconnectedEvent>((event) {
        logRtcEvent(
          event: 'stream.livekit.disconnected',
          rtcKind: 'stream',
          rtcId: streamId,
          roomName: roomName,
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
          metadata: {'reason': event.reason?.name, 'role': 'broadcaster'},
        );
        // Unlike the call/meeting/viewer pages, an involuntary disconnect
        // here does NOT auto-end anything — the backend deliberately does
        // not end a stream when the broadcaster's own connection drops
        // (mirrors meetings' host-leaves policy; only an explicit endStream
        // or LiveKit's own departure-timeout does). Just stop showing a
        // frozen stale frame from before the connection died; the End
        // Stream control and the LiveKit room's own timeout remain the
        // ways this actually resolves.
        if (mounted &&
            event.reason != null &&
            event.reason != lk.DisconnectReason.clientInitiated) {
          setState(() => _videoTrack = null);
        }
      })
      ..on<lk.ParticipantConnectionQualityUpdatedEvent>((event) {
        if (event.connectionQuality == lk.ConnectionQuality.poor) {
          logRtcEvent(
            event: 'stream.livekit.connection_quality_poor',
            rtcKind: 'stream',
            rtcId: streamId,
            roomName: roomName,
            exceptionType: 'CLIENT_ERROR',
            phase: 'connected',
            metadata: {
              'participantId': event.participant.identity,
              'role': 'broadcaster',
            },
          );
        }
      });

    try {
      await room.connect(resolveLivekitUrl(livekitUrl), token);
      if (!mounted || _room != room) {
        await room.disconnect();
        return;
      }
      logRtcEvent(
        event: 'stream.livekit.connected',
        rtcKind: 'stream',
        rtcId: streamId,
        roomName: roomName,
        phase: 'connected',
        metadata: {'role': 'broadcaster'},
      );
      try {
        await room.localParticipant?.setMicrophoneEnabled(true);
      } catch (error, stackTrace) {
        logRtcEvent(
          event: 'stream.media.microphone_enable_failed',
          rtcKind: 'stream',
          rtcId: streamId,
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
          event: 'stream.media.camera_enable_failed',
          rtcKind: 'stream',
          rtcId: streamId,
          roomName: roomName,
          mediaType: 'video',
          exceptionType: 'CLIENT_ERROR',
          error: error,
          stackTrace: stackTrace,
          phase: 'connected',
        );
      }
      _rebuildLocalVideo();
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'stream.livekit.connection_failed',
        rtcKind: 'stream',
        rtcId: streamId,
        roomName: roomName,
        exceptionType: 'CLIENT_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'connecting',
        metadata: {'role': 'broadcaster'},
      );
      // Connection failed — the page's own end control lets the user bail.
    }
  }

  void _rebuildLocalVideo() {
    final local = _room?.localParticipant;
    if (!mounted || local == null) return;
    lk.VideoTrack? video;
    for (final pub in local.videoTrackPublications) {
      if (pub.source == lk.TrackSource.camera && pub.track is lk.VideoTrack) {
        video = pub.track as lk.VideoTrack;
      }
    }
    setState(() => _videoTrack = video);
  }

  void _toggleMic() {
    final room = _room;
    if (room == null) return;
    final next = !_localMicEnabled;
    setState(() => _localMicEnabled = next);
    room.localParticipant?.setMicrophoneEnabled(next).then<void>(
      (_) {},
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'stream.media.microphone_toggle_failed',
          rtcKind: 'stream',
          rtcId: _live?.stream.slug,
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
      (_) => _rebuildLocalVideo(),
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'stream.media.camera_toggle_failed',
          rtcKind: 'stream',
          rtcId: _live?.stream.slug,
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
      (_) => _rebuildLocalVideo(),
      onError: (Object error, StackTrace stackTrace) {
        logRtcEvent(
          event: 'stream.media.screen_share_failed',
          rtcKind: 'stream',
          rtcId: _live?.stream.slug,
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
    final slug = _live?.stream.slug;
    if (text.isEmpty || slug == null) return;
    ref.read(realtimeProvider).send({
      'type': 'rtc:chat-message',
      'slug': slug,
      'text': text,
    });
    _chatController.clear();
  }

  Future<void> _end() async {
    final slug = _live?.stream.slug;
    if (slug == null) return;
    final t = widget.t;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.rtcEndStream),
        content: Text(t.rtcEndStreamConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(t.rtcCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(t.rtcEndStream),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ref.read(streamActionsProvider).end(slug);
      if (mounted) context.go('/v1/${widget.lang}/rtc/live');
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'stream.end_failed',
        rtcKind: 'stream',
        rtcId: slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'active',
      );
      if (mounted) {
        final message =
            error is DioException && (error.message?.isNotEmpty ?? false)
                ? error.message!
                : t.rtcEndStreamFailed;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
      }
    }
  }

  Future<void> _toggleRecording() async {
    final slug = _live?.stream.slug;
    if (slug == null) return;
    setState(() => _recordingBusy = true);
    try {
      final actions = ref.read(streamActionsProvider);
      final next = _recording?.status == 'RECORDING'
          ? await actions.stopRecording(slug)
          : await actions.startRecording(slug);
      if (mounted) setState(() => _recording = next);
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'stream.recording_toggle_failed',
        rtcKind: 'stream',
        rtcId: slug,
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
    final slug = _live?.stream.slug;
    if (_sentJoinChat && slug != null) {
      ref
          .read(realtimeProvider)
          .send({'type': 'rtc:leave-room-chat', 'slug': slug});
    }
    _listener?.dispose();
    _room?.disconnect();
    _titleController.dispose();
    _chatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.t;
    final live = _live;

    if (live == null) {
      return Scaffold(
        appBar: AppBar(title: Text(t.rtcGoLiveTitle)),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText: t.rtcStreamTitlePlaceholder,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _starting ? null : _goLive,
                child: Text(_starting ? t.rtcStartingStream : t.rtcGoLive),
              ),
            ],
          ),
        ),
      );
    }

    ref.listen<StreamSignal>(streamSignalProvider(live.stream.slug), (
      prev,
      next,
    ) {
      if (next.seq == _lastHandledSignalSeq) return;
      _lastHandledSignalSeq = next.seq;
      if (next.viewerCount != null) {
        setState(() => _viewerCount = next.viewerCount!);
      }
    });

    // Chat-room membership (and the viewer-count pushes that ride on it) is
    // per-WS-connection server-side — a reconnect silently drops it. Re-join
    // and refetch the chat backlog whenever the socket comes back, mirroring
    // the web view's [realtimeStatus] effect.
    ref.listen<RealtimeStatus>(realtimeStatusProvider, (prev, next) {
      if (next == RealtimeStatus.open &&
          prev != RealtimeStatus.open &&
          _sentJoinChat) {
        ref.read(realtimeProvider).send({
          'type': 'rtc:join-room-chat',
          'slug': live.stream.slug,
        });
        ref.invalidate(streamChatProvider(live.stream.slug));
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(live.stream.title),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Center(child: Text(t.rtcViewerCount(_viewerCount))),
          ),
          IconButton(
            icon: const Icon(Icons.stop_circle_outlined),
            tooltip: t.rtcEndStream,
            onPressed: _end,
          ),
        ],
      ),
      body: Column(
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: ColoredBox(
              color: Colors.black87,
              child: _videoTrack != null
                  ? lk.VideoTrackRenderer(_videoTrack!)
                  : const SizedBox.shrink(),
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
                        ? AppColors.of(context).danger
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
            child: _StreamChatPanel(
              slug: live.stream.slug,
              controller: _chatController,
              onSend: _sendChat,
            ),
          ),
        ],
      ),
    );
  }
}

class _StreamChatPanel extends ConsumerWidget {
  final String slug;
  final TextEditingController controller;
  final VoidCallback onSend;

  const _StreamChatPanel({
    required this.slug,
    required this.controller,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final PaginatedListState<StreamChatMessage> state = ref.watch(
      streamChatProvider(slug),
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
