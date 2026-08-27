import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_telemetry.dart';
import 'package:flutter_boilerplate/lib/rtc/stream_signal.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:livekit_client/livekit_client.dart' as lk;

import '../../api/client/rtc/streams_actions.dart';
import '../../api/client/rtc/streams_chat_live.dart';
import '../../app_config.dart';
import '../../components/rtc/rtc_report_dialog.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/stream.dart';

enum _ViewerPhase { joining, active, ended, notFound, ownStream }

/// Viewer-only room — the counterpart to [RtcGoLivePageContent]'s
/// broadcaster page. Owns its own Room instance (subscribe-only token) for
/// the same 1:1-with-widget-lifetime reason meeting/go-live pages do.
class RtcLiveViewerPageContent extends ConsumerStatefulWidget {
  final String lang;
  final String slug;

  const RtcLiveViewerPageContent({
    super.key,
    required this.lang,
    required this.slug,
  });

  @override
  ConsumerState<RtcLiveViewerPageContent> createState() =>
      _RtcLiveViewerPageContentState();
}

class _RtcLiveViewerPageContentState
    extends ConsumerState<RtcLiveViewerPageContent> {
  lk.Room? _room;
  lk.EventsListener<lk.RoomEvent>? _listener;
  lk.VideoTrack? _videoTrack;
  bool _broadcasterOnline = false;

  _ViewerPhase _phase = _ViewerPhase.joining;
  LiveStreamJoinResult? _join;
  int _viewerCount = 0;
  bool _sentJoinChat = false;
  int _lastHandledSignalSeq = 0;
  final _chatController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _joinStream();
  }

  Future<void> _joinStream() async {
    try {
      final result = await ref.read(streamActionsProvider).join(widget.slug);
      if (!mounted) return;
      final myId = ref.read(currentUserProvider)?.id;
      if (result.stream.broadcaster.id == myId) {
        setState(() => _phase = _ViewerPhase.ownStream);
        return;
      }
      setState(() {
        _join = result;
        _viewerCount = result.stream.viewerCount;
        _phase = _ViewerPhase.active;
      });
      ref
          .read(realtimeProvider)
          .send({'type': 'rtc:join-room-chat', 'slug': widget.slug});
      _sentJoinChat = true;
      await _connectRoom(
        result.token,
        result.stream.broadcaster.id,
        result.roomName,
      );
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'stream.join_failed',
        rtcKind: 'stream',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'joining',
      );
      if (mounted) setState(() => _phase = _ViewerPhase.notFound);
    }
  }

  Future<void> _connectRoom(
    String token,
    String broadcasterId,
    String roomName,
  ) async {
    final room = lk.Room();
    _room = room;
    final listener = room.createListener();
    _listener = listener;

    logRtcEvent(
      event: 'stream.livekit.connecting',
      rtcKind: 'stream',
      rtcId: widget.slug,
      roomName: roomName,
      phase: 'connecting',
      metadata: {'role': 'viewer'},
    );

    void rebuild() => _rebuildBroadcasterTrack(broadcasterId);

    listener
      ..on<lk.ParticipantConnectedEvent>((_) => rebuild())
      ..on<lk.ParticipantDisconnectedEvent>((_) => rebuild())
      ..on<lk.TrackSubscribedEvent>((_) => rebuild())
      ..on<lk.TrackUnsubscribedEvent>((_) => rebuild())
      ..on<lk.RoomReconnectingEvent>((_) {
        logRtcEvent(
          event: 'stream.livekit.reconnecting',
          rtcKind: 'stream',
          rtcId: widget.slug,
          roomName: roomName,
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
          metadata: {'role': 'viewer'},
        );
      })
      ..on<lk.RoomReconnectedEvent>((_) {
        logRtcEvent(
          event: 'stream.livekit.reconnected',
          rtcKind: 'stream',
          rtcId: widget.slug,
          roomName: roomName,
          phase: 'connected',
          metadata: {'role': 'viewer'},
        );
        rebuild();
      })
      ..on<lk.RoomDisconnectedEvent>((event) {
        logRtcEvent(
          event: 'stream.livekit.disconnected',
          rtcKind: 'stream',
          rtcId: widget.slug,
          roomName: roomName,
          exceptionType: 'CLIENT_ERROR',
          phase: 'connected',
          metadata: {'reason': event.reason?.name, 'role': 'viewer'},
        );
        // clientInitiated means our own teardown called disconnect() —
        // already an intentional exit. Any other reason is an involuntary
        // death (LiveKit's own reconnect gave up) nothing else recovers
        // from client-side — without this the viewer is stuck on a frozen
        // frame with no indication the connection is dead. Treat it the
        // same as the user tapping Leave.
        if (mounted &&
            event.reason != null &&
            event.reason != lk.DisconnectReason.clientInitiated) {
          _leave();
        }
      })
      ..on<lk.ParticipantConnectionQualityUpdatedEvent>((event) {
        if (event.connectionQuality == lk.ConnectionQuality.poor) {
          logRtcEvent(
            event: 'stream.livekit.connection_quality_poor',
            rtcKind: 'stream',
            rtcId: widget.slug,
            roomName: roomName,
            exceptionType: 'CLIENT_ERROR',
            phase: 'connected',
            metadata: {
              'participantId': event.participant.identity,
              'role': 'viewer',
            },
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
        event: 'stream.livekit.connected',
        rtcKind: 'stream',
        rtcId: widget.slug,
        roomName: roomName,
        phase: 'connected',
        metadata: {'role': 'viewer'},
      );
      rebuild();
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'stream.livekit.connection_failed',
        rtcKind: 'stream',
        rtcId: widget.slug,
        roomName: roomName,
        exceptionType: 'CLIENT_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'connecting',
        metadata: {'role': 'viewer'},
      );
      // Connection failed — the page's own leave control lets the user bail.
    }
  }

  void _rebuildBroadcasterTrack(String broadcasterId) {
    final room = _room;
    if (!mounted || room == null) return;
    final broadcaster = room.remoteParticipants.values
        .where((p) => p.identity == broadcasterId)
        .firstOrNull;
    if (broadcaster == null) {
      setState(() {
        _broadcasterOnline = false;
        _videoTrack = null;
      });
      return;
    }
    lk.VideoTrack? video;
    for (final pub in broadcaster.videoTrackPublications) {
      if (pub.track is lk.VideoTrack) {
        video = pub.track as lk.VideoTrack;
      }
    }
    setState(() {
      _broadcasterOnline = true;
      _videoTrack = video;
    });
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

  Future<void> _teardownRoom() async {
    final listener = _listener;
    final room = _room;
    _listener = null;
    _room = null;
    await listener?.dispose();
    await room?.disconnect();
  }

  Future<void> _leave() async {
    try {
      await ref.read(streamActionsProvider).leave(widget.slug);
      if (mounted) context.pop();
    } catch (error, stackTrace) {
      logRtcEvent(
        event: 'stream.leave_failed',
        rtcKind: 'stream',
        rtcId: widget.slug,
        exceptionType: 'CLIENT_REQUEST_ERROR',
        error: error,
        stackTrace: stackTrace,
        phase: 'active',
      );
    }
  }

  Future<void> _report() async {
    await showDialog<void>(
      context: context,
      builder: (context) => RtcReportDialog(
        onSubmit: (reason, details) => ref
            .read(streamActionsProvider)
            .report(
              widget.slug,
              reason,
              details: details,
              reportedUserId: _join?.stream.broadcaster.id,
            )
            .catchError((Object error) {
          logRtcEvent(
            event: 'stream.report_failed',
            rtcKind: 'stream',
            rtcId: widget.slug,
            exceptionType: 'CLIENT_REQUEST_ERROR',
            error: error,
            metadata: {'reason': reason},
          );
        }),
      ),
    );
  }

  @override
  void dispose() {
    if (_sentJoinChat) {
      ref
          .read(realtimeProvider)
          .send({'type': 'rtc:leave-room-chat', 'slug': widget.slug});
    }
    ref
        .read(streamActionsProvider)
        .leave(widget.slug)
        .catchError((Object error) {
      logRtcEvent(
        event: 'stream.leave_failed',
        rtcKind: 'stream',
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

    if (_phase == _ViewerPhase.active) {
      ref.listen<StreamSignal>(streamSignalProvider(widget.slug), (
        prev,
        next,
      ) {
        if (next.seq == _lastHandledSignalSeq) return;
        _lastHandledSignalSeq = next.seq;
        if (next.ended) {
          setState(() => _phase = _ViewerPhase.ended);
          // Was only ever torn down from dispose() — a remote stream-ended
          // signal left the viewer's LiveKit connection open indefinitely
          // until the user happened to navigate away.
          _teardownRoom();
        } else if (next.viewerCount != null) {
          setState(() => _viewerCount = next.viewerCount!);
        }
      });
    }

    if (_phase == _ViewerPhase.joining) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 12),
              Text(t.rtcJoiningStream),
            ],
          ),
        ),
      );
    }

    if (_phase == _ViewerPhase.ownStream) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(t.rtcOwnStreamNotice),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () =>
                    context.go('/v1/${widget.lang}/rtc/live/go-live'),
                child: Text(t.rtcManageStream),
              ),
            ],
          ),
        ),
      );
    }

    if (_phase != _ViewerPhase.active) {
      final message = _phase == _ViewerPhase.notFound
          ? t.rtcStreamNotFound
          : t.rtcStreamEndedNotice;
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(message),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => context.go('/v1/${widget.lang}/rtc/live'),
                child: Text(t.rtcBackToLive),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_join?.stream.title ?? ''),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Center(child: Text(t.rtcViewerCount(_viewerCount))),
          ),
          IconButton(
            icon: const Icon(Icons.flag_outlined),
            tooltip: t.rtcReportTitle,
            onPressed: _report,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: t.rtcLeaveStream,
            onPressed: _leave,
          ),
        ],
      ),
      body: Column(
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: ColoredBox(
              color: Colors.black87,
              child: _broadcasterOnline && _videoTrack != null
                  ? lk.VideoTrackRenderer(_videoTrack!)
                  : Center(
                      child: Text(
                        t.rtcBroadcasterOffline,
                        style: const TextStyle(color: Colors.white70),
                      ),
                    ),
            ),
          ),
          Expanded(
            child: Column(
              children: [
                Expanded(
                  child:
                      ref.watch(streamChatProvider(widget.slug)).items.isEmpty
                          ? Center(child: Text(t.rtcNoChatMessages))
                          : _StreamChatList(slug: widget.slug),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _chatController,
                          decoration: InputDecoration(
                            hintText: t.rtcChatPlaceholder,
                          ),
                          onSubmitted: (_) => _sendChat(),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: _sendChat,
                      ),
                    ],
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

class _StreamChatList extends ConsumerWidget {
  final String slug;

  const _StreamChatList({required this.slug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final PaginatedListState<StreamChatMessage> state = ref.watch(
      streamChatProvider(slug),
    );
    return ListView.builder(
      itemCount: state.items.length,
      itemBuilder: (context, index) {
        final m = state.items[index];
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          child: RichText(
            text: TextSpan(
              style: DefaultTextStyle.of(context).style,
              children: [
                TextSpan(
                  text: '${m.senderName}: ',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                TextSpan(text: m.text),
              ],
            ),
          ),
        );
      },
    );
  }
}
