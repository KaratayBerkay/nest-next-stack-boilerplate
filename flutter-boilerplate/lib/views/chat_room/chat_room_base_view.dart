import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/actions.dart';
import '../../api/client/messages/query.dart';
import '../../api/server/messages/room_attachments.dart';
import '../../components/ui/attachment_preview/attachment_gallery_sheet.dart';
import '../../components/ui/toast/toast.dart';
import '../../constants/chat.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message.dart';
import '../../types/messages/message_attachment.dart';
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
  MessageAttachment? _pendingAttachment;
  bool _attaching = false;
  bool _emojiOpen = false;

  List<String> get vipRooms => const [];
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
    // Block send while the attachment upload is in flight — sending early
    // silently drops the attachment. Covers the keyboard/IME submit path,
    // which bypasses SendButton's disabled state (F35).
    if (_attaching) return;
    final text = _messageController.text.trim();
    if (text.isEmpty && _pendingAttachment == null) return;

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final client = ref.read(realtimeProvider);
    final attachment = _pendingAttachment;
    final attachments = attachment == null ? null : [attachment.toJson()];
    client.send(
      _isNamedRoom
          ? {
              'type': 'room-message',
              'room': _room,
              'text': text,
              if (attachments != null) 'attachments': attachments,
            }
          : {
              'type': 'direct-message',
              'recipientId': _room,
              'text': text,
              if (attachments != null) 'attachments': attachments,
            },
    );
    _messageController.clear();
    setState(() {
      _pendingAttachment = null;
      _emojiOpen = false;
    });
    _scrollToBottom();
  }

  Future<void> _pickAttachment() async {
    final result = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: const [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',
        'avif',
        'pdf',
        'doc',
        'docx',
        'txt',
      ],
    );
    if (result == null || result.files.isEmpty) return;
    if (!mounted) return;

    final file = result.files.first;
    final path = file.path;
    if (path == null) return;

    final t = AppLocalizations.of(context);
    if (file.size > ChatConstants.maxAttachmentSize) {
      showToast(context, t.messagesAttachmentTooLarge);
      return;
    }

    setState(() => _attaching = true);
    try {
      final attachment =
          await ref.read(messageActionsProvider).uploadAttachment(
                path,
                file.name,
                scopeKind: 'chat-room',
                scopeId: _room,
              );
      if (!mounted) return;
      setState(() {
        _pendingAttachment = attachment;
        _attaching = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _attaching = false);
      showToast(context, t.messagesAttachmentUploadFailed);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) => _settleToBottom());
  }

  /// `maxScrollExtent` is only an estimate until every item between the
  /// current viewport and the end has actually been built — `ListView`
  /// only lays out items near what's visible. For a long room, a single
  /// jump/animate to that estimate undershoots, because scrolling through
  /// is what makes Flutter build (and correct the estimate for) the rest.
  /// Keep jumping to the newest estimate, one frame at a time, until it
  /// stops growing, then finish with one smooth animation.
  void _settleToBottom([int attempt = 0]) {
    if (!_scrollController.hasClients) return;
    final before = _scrollController.position.maxScrollExtent;
    _scrollController.jumpTo(before);
    if (attempt >= 8) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      final after = _scrollController.position.maxScrollExtent;
      if (after > before) {
        _settleToBottom(attempt + 1);
      } else {
        _scrollController.animateTo(
          after,
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final connected = ref.watch(realtimeConnectedProvider);
    final PaginatedListState<ChatMessage> messagesState;
    final VoidCallback onLoadMore;
    if (_isNamedRoom) {
      final roomState = ref.watch(roomMessagesProvider(_room));
      messagesState = PaginatedListState<ChatMessage>(
        items: roomState.items
            .map(
              (m) => ChatMessage(
                id: m.id,
                conversationId: _room,
                senderId: m.senderId,
                senderName: m.senderName,
                senderAvatarUrl: m.avatar,
                content: m.body,
                attachments: m.attachments,
                createdAt: DateTime.parse(m.createdAt),
                isRead: true,
              ),
            )
            .toList(),
        hasMore: roomState.hasMore,
        isLoadingMore: roomState.isLoadingMore,
        isInitialLoading: roomState.isInitialLoading,
        error: roomState.error,
      );
      onLoadMore =
          () => ref.read(roomMessagesProvider(_room).notifier).loadMore();
    } else {
      messagesState = ref.watch(conversationMessagesProvider(_room));
      onLoadMore = () =>
          ref.read(conversationMessagesProvider(_room).notifier).loadMore();
    }
    final roomCounts = ref.watch(roomCountsProvider);
    final roomMembers = ref.watch(roomMembersProvider(_room));
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 768;

    final currentMessages = messagesState.items;
    if (currentMessages.isNotEmpty) {
      final newLastId = currentMessages.last.id;
      // `_lastMessageLastId` starts null, so the first successful load also
      // satisfies `newLastId != _lastMessageLastId` — that's intentional
      // (mirrors the web's `useAutoScroll`, whose `lastIdRef` starts null
      // too) and is what makes a freshly-opened room land at the bottom
      // instead of wherever ListView happens to initialize.
      if (newLastId != _lastMessageLastId && _isAtBottom) {
        _scrollToBottom();
      }
      _lastMessageLastId = newLastId;
    }

    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }

    // Real room list from the backend (matches web's `roomsQueryOptions()`);
    // falls back to the compile-time default while loading or on error so a
    // slow/broken `/api/rooms` call never blocks the room from being usable.
    final baseRooms = ref.watch(roomsProvider).maybeWhen(
          data: (rooms) => rooms.where((r) => !r.startsWith('vip-')).toList(),
          orElse: () => ChatConstants.chatRooms,
        );
    final allRooms = [...baseRooms, ...vipRooms];

    final t = AppLocalizations.of(context);

    final sidebar = ChatRoomSidebar(
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

    final Widget messagesContent;
    if (messagesState.isInitialLoading) {
      messagesContent = const Center(child: CircularProgressIndicator());
    } else if (messagesState.error != null) {
      messagesContent = Center(
        child: Text('${t.errorSomethingWentWrong}: ${messagesState.error}'),
      );
    } else {
      messagesContent = ChatRoomMainContent(
        room: _room,
        roomCounts: roomCounts,
        connectionState: _connectionState,
        messages: messagesState.items,
        hasMore: messagesState.hasMore,
        isLoadingMore: messagesState.isLoadingMore,
        onLoadMore: onLoadMore,
        userId: user.id,
        messageController: _messageController,
        scrollController: _scrollController,
        isAtBottom: _isAtBottom,
        attaching: _attaching,
        emojiOpen: _emojiOpen,
        pendingAttachment: _pendingAttachment,
        onSetSidebarOpen: (v) => setState(() => _sidebarOpen = v),
        onSend: _handleSend,
        onAttachFile: _pickAttachment,
        onRemoveAttachment: () => setState(() => _pendingAttachment = null),
        onToggleEmoji: () => setState(() => _emojiOpen = !_emojiOpen),
      );
    }

    return Column(
      children: [
        ChatRoomHeader(
          userName: user.name,
          userEmail: user.email,
          connectionState: connected ? 'online' : 'disconnected',
          showPageInfo: widget.showPageInfo,
          onOpenGallery: () => AttachmentGallerySheet.show(
            context,
            fetchPage: ({before, take = 30}) => ref
                .read(roomAttachmentsServerProvider)
                .call(_room, before: before, take: take),
          ),
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
                      width: width,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeOut,
                      child: sidebar,
                    ),
                  ],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SizedBox(width: 220, child: sidebar),
                    const SizedBox(width: 12),
                    Expanded(child: messagesContent),
                  ],
                ),
        ),
      ],
    );
  }
}
