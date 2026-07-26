import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/query.dart';
import '../../constants/chat.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message.dart';
import 'chat_room_header.dart';
import 'chat_room_main_content.dart';
import 'chat_room_sidebar.dart';

class ChatRoomBaseView extends ConsumerStatefulWidget {
  final String? lang;
  final String initialRoom;
  final bool showPageInfo;

  const ChatRoomBaseView({
    super.key,
    this.lang,
    this.initialRoom = 'general',
    this.showPageInfo = false,
  });

  @override
  ConsumerState<ChatRoomBaseView> createState() => ChatRoomBaseViewState();
}

class ChatRoomBaseViewState extends ConsumerState<ChatRoomBaseView> {
  late String _room;
  bool _sidebarOpen = false;
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isAtBottom = true;
  String? _lastMessageLastId;

  List<String> get vipRooms => const [];
  bool get useNativeControls => false;
  bool get showSelfCrown => false;
  String get _connectionState => 'online';

  /// `ChatRoomBaseView` is reused by the legacy `/v1/:lang/chat/:conversationId`
  /// route for 1:1 DM threads, where `_room` is actually a peer's user id, not
  /// a named room — `isValidRoom` on the backend (and the room-scoped realtime
  /// verbs: room-message, get-room-counts, the chat-room page claim) only make
  /// sense for the named-room case. Mirrors the backend's own
  /// `isValidRoom`/`VIP_ROOM_PREFIX` check (messaging-room.service.ts).
  bool get _isNamedRoom =>
      ChatConstants.chatRooms.contains(_room) ||
      vipRooms.contains(_room) ||
      _room.startsWith('vip-');

  @override
  void initState() {
    super.initState();
    _room = widget.initialRoom;
    _scrollController.addListener(_onScroll);
    // SendButton's `disabled` is computed from messageController.text at
    // build time (mirrors the web's `disabled={!text.trim()}`, which
    // re-renders on every keystroke via controlled-input state) — without
    // this listener nothing ever rebuilds ChatRoomBaseView as the user
    // types, so the button stays stuck at whatever it was on the last
    // unrelated rebuild (typically disabled, from when the field was empty).
    _messageController.addListener(_onMessageTextChanged);
    _setupRealtime();
  }

  @override
  void dispose() {
    _messageController.removeListener(_onMessageTextChanged);
    _messageController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onMessageTextChanged() => setState(() {});

  void _onScroll() {
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    final atBottom = (maxScroll - currentScroll) < 50;
    if (atBottom != _isAtBottom) {
      setState(() => _isAtBottom = atBottom);
    }
  }

  void _setupRealtime() {
    // Joining the room itself is handled by the route-driven page claim
    // (RealtimeLifecycle claims 'chat-room' with this room on entering this
    // route — see convert-frontend-7-flutter.md §9.1/§10 D9). `watch()` was
    // never the right mechanism for room membership (§9.3) and is gone.
    if (!_isNamedRoom) return;
    final client = ref.read(realtimeProvider);
    client.send({'type': 'get-room-counts'});
  }

  void _selectRoom(String r) {
    setState(() {
      _room = r;
      _sidebarOpen = false;
      _lastMessageLastId = null;
    });
    // Switching rooms in-page doesn't change the route, so the router-level
    // claim (above) won't see it — claim the new room directly (§10 D11).
    final client = ref.read(realtimeProvider);
    client.claimPage('chat-room', params: {'room': r});
    client.send({'type': 'get-room-counts'});
  }

  void _handleSend() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final client = ref.read(realtimeProvider);
    client.send(
      _isNamedRoom
          ? {'type': 'room-message', 'room': _room, 'text': text}
          : {'type': 'direct-message', 'recipientId': _room, 'text': text},
    );
    _messageController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final connected = ref.watch(realtimeConnectedProvider);
    final messagesAsync = _isNamedRoom
        ? ref.watch(roomMessagesProvider(_room)).whenData(
              (messages) => messages
                  .map(
                    (m) => ChatMessage(
                      id: m.id,
                      conversationId: _room,
                      senderId: m.senderId,
                      senderName: m.senderName,
                      senderAvatarUrl: m.avatar,
                      content: m.body,
                      createdAt: DateTime.parse(m.createdAt),
                      isRead: true,
                    ),
                  )
                  .toList(),
            )
        : ref.watch(conversationMessagesProvider(_room));
    final roomCounts = ref.watch(roomCountsProvider);
    final roomMembers = ref.watch(roomMembersProvider(_room));
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 768;

    final currentMessages = messagesAsync.asData?.value;
    if (currentMessages != null && currentMessages.isNotEmpty) {
      final newLastId = currentMessages.last.id;
      if (_lastMessageLastId != null &&
          newLastId != _lastMessageLastId &&
          _isAtBottom) {
        _scrollToBottom();
      }
      _lastMessageLastId = newLastId;
    }

    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final allRooms = [...ChatConstants.chatRooms, ...vipRooms];

    final t = AppLocalizations.of(context);

    final sidebar = ChatRoomSidebar(
      useNativeControls: useNativeControls,
      sidebarOpen: _sidebarOpen,
      rooms: allRooms,
      room: _room,
      roomCounts: roomCounts,
      vipRooms: vipRooms,
      roomMembers: roomMembers,
      currentUserId: user.id,
      showSelfCrown: showSelfCrown,
      onSetSidebarOpen: (v) => setState(() => _sidebarOpen = v),
      onSelectRoom: _selectRoom,
    );

    final messagesContent = messagesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('${t.errorSomethingWentWrong}: $e')),
      data: (messages) => ChatRoomMainContent(
        useNativeControls: useNativeControls,
        room: _room,
        roomCounts: roomCounts,
        connectionState: _connectionState,
        messages: messages,
        userId: user.id,
        messageController: _messageController,
        scrollController: _scrollController,
        isAtBottom: _isAtBottom,
        onSetSidebarOpen: (v) => setState(() => _sidebarOpen = v),
        onSend: _handleSend,
        onScrollToBottom: _scrollToBottom,
      ),
    );

    return Column(
      children: [
        ChatRoomHeader(
          userName: user.name,
          userEmail: user.email,
          connectionState: connected ? 'online' : 'disconnected',
          showPageInfo: widget.showPageInfo,
          onPageInfo: widget.showPageInfo
              ? () => showDialog<void>(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: Text(t.chatRoomTitle),
                      content: const Text(
                        'Real-time chat rooms with multiple topics.',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text(t.v1ShellClose),
                        ),
                      ],
                    ),
                  )
              : null,
        ),
        const SizedBox(height: 8),
        Expanded(
          child: isMobile
              ? Stack(
                  children: [
                    messagesContent,
                    if (_sidebarOpen)
                      GestureDetector(
                        onTap: () => setState(() => _sidebarOpen = false),
                        child: Container(
                          color: Colors.black.withValues(alpha: 0.3),
                        ),
                      ),
                    AnimatedPositioned(
                      left: _sidebarOpen ? 0 : -width,
                      top: 0,
                      bottom: 0,
                      width: width * 0.8,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeOut,
                      child: sidebar,
                    ),
                  ],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    sidebar,
                    const SizedBox(width: 12),
                    Expanded(child: messagesContent),
                  ],
                ),
        ),
      ],
    );
  }
}
