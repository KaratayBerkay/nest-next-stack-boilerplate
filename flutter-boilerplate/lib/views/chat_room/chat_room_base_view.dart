import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/query.dart';
import '../../constants/chat.dart';
import '../../hooks/use_auth.dart';
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
  final Map<String, int> _roomCounts = {};
  List<Map<String, String?>> _roomMembers = [];

  List<String> get vipRooms => const [];
  bool get useNativeControls => false;
  bool get showSelfCrown => false;
  String get _connectionState => 'online';

  @override
  void initState() {
    super.initState();
    _room = widget.initialRoom;
    _scrollController.addListener(_onScroll);
    _setupRealtime();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    final atBottom = (maxScroll - currentScroll) < 50;
    if (atBottom != _isAtBottom) {
      setState(() => _isAtBottom = atBottom);
    }
  }

  void _setupRealtime() {
    final client = ref.read(realtimeProvider);
    final room = _room;

    client.watch('room:$room');
    client.send({'type': 'get-room-counts'});
  }

  void _selectRoom(String r) {
    setState(() {
      _room = r;
      _roomMembers = [];
      _sidebarOpen = false;
    });
    final client = ref.read(realtimeProvider);
    client.send({'type': 'get-room-counts'});
  }

  void _handleSend() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final client = ref.read(realtimeProvider);
    client.send({
      'type': 'room-message',
      'room': _room,
      'text': text,
    });
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
    final messagesAsync = ref.watch(conversationMessagesProvider(_room));

    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final allRooms = [...ChatConstants.chatRooms, ...vipRooms];

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
                      title: const Text('Chat Rooms'),
                      content: const Text(
                        'Real-time chat rooms with multiple topics.',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Close'),
                        ),
                      ],
                    ),
                  )
              : null,
        ),
        const SizedBox(height: 8),
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_sidebarOpen)
                GestureDetector(
                  onTap: () => setState(() => _sidebarOpen = false),
                  child: Container(color: Colors.black26),
                ),
              ChatRoomSidebar(
                useNativeControls: useNativeControls,
                sidebarOpen: _sidebarOpen,
                rooms: allRooms,
                room: _room,
                roomCounts: _roomCounts,
                vipRooms: vipRooms,
                roomMembers: _roomMembers,
                currentUserId: user.id,
                showSelfCrown: showSelfCrown,
                onSetSidebarOpen: (v) => setState(() => _sidebarOpen = v),
                onSelectRoom: _selectRoom,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: messagesAsync.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error: $e')),
                  data: (messages) => ChatRoomMainContent(
                    useNativeControls: useNativeControls,
                    room: _room,
                    roomCounts: _roomCounts,
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
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
