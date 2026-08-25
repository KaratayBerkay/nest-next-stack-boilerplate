import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/meeting_signal.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:livekit_client/livekit_client.dart' as lk;

import '../../api/client/friends/query.dart';
import '../../api/client/rtc/meetings_actions.dart';
import '../../api/client/rtc/meetings_chat_live.dart';
import '../../app_config.dart';
import '../../components/rtc/rtc_report_dialog.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/meeting.dart';
import '../../types/rtc/recording.dart';

enum _RoomPhase { joining, active, ended, removed, notFound }

class _ParticipantView {
  final String identity;
  final String name;
  final bool isLocal;
  final lk.VideoTrack? videoTrack;
  final lk.VideoTrack? screenShareTrack;
  final bool micEnabled;
  final bool cameraEnabled;
  final bool screenShareEnabled;

  const _ParticipantView({
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
  List<_ParticipantView> _participants = [];
  bool _localMicEnabled = true;
  bool _localCameraEnabled = true;
  bool _localScreenShareEnabled = false;

  _RoomPhase _phase = _RoomPhase.joining;
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
    _joinMeeting();
  }

  Future<void> _joinMeeting() async {
    try {
      final result = await ref.read(meetingActionsProvider).join(widget.slug);
      if (!mounted) return;
      setState(() {
        _join = result;
        _phase = _RoomPhase.active;
      });
      ref
          .read(realtimeProvider)
          .send({'type': 'rtc:join-room-chat', 'slug': widget.slug});
      _sentJoinChat = true;
      await _connectRoom(result.token);
    } catch (_) {
      if (mounted) setState(() => _phase = _RoomPhase.notFound);
    }
  }

  Future<void> _connectRoom(String token) async {
    final room = lk.Room();
    _room = room;
    final listener = room.createListener();
    _listener = listener;

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
        debugPrint('[MeetingRoom] Reconnecting…');
      })
      ..on<lk.RoomReconnectedEvent>((_) {
        debugPrint('[MeetingRoom] Reconnected');
        _rebuildParticipants();
      });

    try {
      await room.connect(AppConfig.livekitUrl, token);
      if (!mounted || _room != room) {
        await room.disconnect();
        return;
      }
      await room.localParticipant?.setMicrophoneEnabled(true);
      await room.localParticipant?.setCameraEnabled(true);
      _rebuildParticipants();
    } catch (_) {
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

  _ParticipantView _toView(lk.Participant p) {
    lk.VideoTrack? findVideo(lk.TrackSource source) {
      for (final pub in p.videoTrackPublications) {
        if (pub.source == source && pub.track is lk.VideoTrack) {
          return pub.track as lk.VideoTrack;
        }
      }
      return null;
    }

    return _ParticipantView(
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
    room.localParticipant
        ?.setMicrophoneEnabled(next)
        .then((_) => _rebuildParticipants());
  }

  void _toggleCamera() {
    final room = _room;
    if (room == null) return;
    final next = !_localCameraEnabled;
    setState(() => _localCameraEnabled = next);
    room.localParticipant
        ?.setCameraEnabled(next)
        .then((_) => _rebuildParticipants());
  }

  void _toggleScreenShare() {
    final room = _room;
    if (room == null) return;
    final next = !_localScreenShareEnabled;
    setState(() => _localScreenShareEnabled = next);
    room.localParticipant
        ?.setScreenShareEnabled(next)
        .then((_) => _rebuildParticipants())
        .catchError((_) {
      if (mounted) setState(() => _localScreenShareEnabled = false);
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

  Future<void> _leave() async {
    await ref.read(meetingActionsProvider).leave(widget.slug);
    if (mounted) context.pop();
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
    await ref.read(meetingActionsProvider).end(widget.slug);
    if (mounted) context.pop();
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
        onSubmit: (reason, details) => ref
            .read(meetingActionsProvider)
            .report(widget.slug, reason, details: details),
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
    } finally {
      if (mounted) setState(() => _recordingBusy = false);
    }
  }

  @override
  void dispose() {
    if (_sentJoinChat) {
      ref
          .read(realtimeProvider)
          .send({'type': 'rtc:leave-room-chat', 'slug': widget.slug});
    }
    ref.read(meetingActionsProvider).leave(widget.slug);
    _teardownRoom();
    _chatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);

    ref.listen<MeetingSignal>(meetingSignalProvider(widget.slug), (
      prev,
      next,
    ) {
      if (next.seq == _lastHandledSignalSeq) return;
      _lastHandledSignalSeq = next.seq;
      if (next.ended) {
        setState(() => _phase = _RoomPhase.ended);
      } else if (next.removed) {
        setState(() => _phase = _RoomPhase.removed);
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${next.joinedName} joined')),
        );
      }
    });

    if (_phase == _RoomPhase.joining) {
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

    if (_phase != _RoomPhase.active) {
      final message = switch (_phase) {
        _RoomPhase.notFound => t.rtcMeetingNotFound,
        _RoomPhase.removed => t.rtcMeetingRemovedNotice,
        _ => t.rtcMeetingEndedNotice,
      };
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
                      color:
                          _recording?.status == 'RECORDING' ? Colors.red : null,
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
              itemCount: _participants.length,
              itemBuilder: (context, index) =>
                  _ParticipantTile(participant: _participants[index], t: t),
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
  final _ParticipantView participant;
  final AppLocalizations t;

  const _ParticipantTile({required this.participant, required this.t});

  @override
  Widget build(BuildContext context) {
    final track = participant.screenShareTrack ?? participant.videoTrack;
    final showVideo = track != null && participant.cameraEnabled;

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Container(
        color: Colors.black87,
        child: Stack(
          children: [
            if (showVideo)
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
                      participant.isLocal ? t.rtcYouLabel : participant.name,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (!participant.micEnabled)
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
    final t = AppLocalizations.of(context);
    final PaginatedListState<MeetingChatMessage> state = ref.watch(
      meetingChatProvider(slug),
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

class _ParticipantsPanel extends ConsumerWidget {
  final List<_ParticipantView> participants;
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
                      onPressed: () => ref
                          .read(meetingActionsProvider)
                          .muteParticipant(slug, p.identity, true),
                    ),
                    IconButton(
                      icon: const Icon(Icons.person_remove, size: 18),
                      tooltip: t.rtcRemoveParticipant,
                      onPressed: () => ref
                          .read(meetingActionsProvider)
                          .removeParticipant(slug, p.identity),
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
    await ref.read(meetingActionsProvider).invite(widget.slug, userId);
    if (mounted) setState(() => _invitedIds.add(userId));
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
