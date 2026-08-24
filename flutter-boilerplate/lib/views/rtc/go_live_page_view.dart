import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/stream_signal.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:livekit_client/livekit_client.dart' as lk;

import '../../api/client/rtc/streams_actions.dart';
import '../../api/client/rtc/streams_chat_live.dart';
import '../../app_config.dart';
import '../../l10n/app_localizations.dart';
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
      ref.read(realtimeProvider).send({
        'type': 'rtc:join-room-chat',
        'slug': result.stream.slug,
      });
      _sentJoinChat = true;
      await _connectRoom(result.token);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  Future<void> _connectRoom(String token) async {
    final room = lk.Room();
    _room = room;
    final listener = room.createListener();
    _listener = listener;

    listener
      ..on<lk.LocalTrackPublishedEvent>((_) => _rebuildLocalVideo())
      ..on<lk.LocalTrackUnpublishedEvent>((_) => _rebuildLocalVideo());

    try {
      await room.connect(AppConfig.livekitUrl, token);
      if (!mounted || _room != room) {
        await room.disconnect();
        return;
      }
      await room.localParticipant?.setMicrophoneEnabled(true);
      await room.localParticipant?.setCameraEnabled(true);
      _rebuildLocalVideo();
    } catch (_) {
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
    room.localParticipant?.setMicrophoneEnabled(next);
  }

  void _toggleCamera() {
    final room = _room;
    if (room == null) return;
    final next = !_localCameraEnabled;
    setState(() => _localCameraEnabled = next);
    room.localParticipant
        ?.setCameraEnabled(next)
        .then((_) => _rebuildLocalVideo());
  }

  void _toggleScreenShare() {
    final room = _room;
    if (room == null) return;
    final next = !_localScreenShareEnabled;
    setState(() => _localScreenShareEnabled = next);
    room.localParticipant
        ?.setScreenShareEnabled(next)
        .then((_) => _rebuildLocalVideo())
        .catchError((_) {
      if (mounted) setState(() => _localScreenShareEnabled = false);
    });
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
    await ref.read(streamActionsProvider).end(slug);
    if (mounted) context.go('/v1/${widget.lang}/rtc/live');
  }

  @override
  void dispose() {
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
    final t = AppLocalizations.of(context);
    final PaginatedListState<StreamChatMessage> state = ref.watch(
      streamChatProvider(slug),
    );

    return Column(
      children: [
        Expanded(
          child: state.items.isEmpty
              ? Center(child: Text(t.rtcNoChatMessages))
              : ListView.builder(
                  itemCount: state.items.length,
                  itemBuilder: (context, index) {
                    final m = state.items[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      child: RichText(
                        text: TextSpan(
                          style: DefaultTextStyle.of(context).style,
                          children: [
                            TextSpan(
                              text: '${m.senderName}: ',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(text: m.text),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  decoration: InputDecoration(hintText: t.rtcChatPlaceholder),
                  onSubmitted: (_) => onSend(),
                ),
              ),
              IconButton(icon: const Icon(Icons.send), onPressed: onSend),
            ],
          ),
        ),
      ],
    );
  }
}
