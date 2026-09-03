import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../../types/messages/message.dart';
import '../../server/messages/conversation_messages.dart';
import '../../server/messages/conversations.dart';
import '../../server/messages/dm_unread_count.dart';
import '../../server/messages/room_messages.dart';
import '../../server/messages/rooms.dart';

final conversationsProvider = FutureProvider((ref) async {
  final server = ref.read(conversationsServerProvider);
  return server.call();
});

final roomsProvider = FutureProvider((ref) async {
  final server = ref.read(roomsServerProvider);
  return server.call();
});

final dmUnreadCountProvider = FutureProvider((ref) async {
  final server = ref.read(dmUnreadCountServerProvider);
  return server.call();
});

// `items` is chronological ascending (oldest first, matching a
// bottom-anchored chat scroll) for both message lists below — `loadMore()`
// (older history) prepends and `appendLive()` (a just-arrived message)
// appends.

final conversationMessagesProvider = StateNotifierProvider.family<
    PaginatedConversationMessagesNotifier,
    PaginatedListState<ChatMessage>,
    String>(
  (ref, peerId) => PaginatedConversationMessagesNotifier(
    ref.read(conversationMessagesServerProvider),
    peerId,
  ),
);

class PaginatedConversationMessagesNotifier
    extends StateNotifier<PaginatedListState<ChatMessage>> {
  final ConversationMessagesServer _server;
  final String peerId;

  PaginatedConversationMessagesNotifier(this._server, this.peerId)
      : super(const PaginatedListState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = const PaginatedListState();
    try {
      final page = await _server.call(peerId);
      state = PaginatedListState(
        items: page.messages,
        hasMore: page.hasMore,
        isInitialLoading: false,
      );
    } catch (e) {
      state = PaginatedListState(error: e.toString(), isInitialLoading: false);
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore || state.items.isEmpty) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final before = state.items.first.createdAt.toIso8601String();
      final page = await _server.call(peerId, before: before);
      state = state.copyWith(
        items: [...page.messages, ...state.items],
        hasMore: page.hasMore,
        isLoadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  Future<void> refresh() => _initialLoad();

  void appendLive(ChatMessage message) {
    if (state.items.any((m) => m.id == message.id)) return;
    state = state.copyWith(items: [...state.items, message]);
  }
}

final roomMessagesProvider = StateNotifierProvider.family<
    PaginatedRoomMessagesNotifier, PaginatedListState<RoomMessage>, String>(
  (ref, room) =>
      PaginatedRoomMessagesNotifier(ref.read(roomMessagesServerProvider), room),
);

class PaginatedRoomMessagesNotifier
    extends StateNotifier<PaginatedListState<RoomMessage>> {
  final RoomMessagesServer _server;
  final String room;

  PaginatedRoomMessagesNotifier(this._server, this.room)
      : super(const PaginatedListState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = const PaginatedListState();
    try {
      final page = await _server.call(room);
      state = PaginatedListState(
        items: page.messages,
        hasMore: page.hasMore,
        isInitialLoading: false,
      );
    } catch (e) {
      state = PaginatedListState(error: e.toString(), isInitialLoading: false);
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore || state.items.isEmpty) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final before = state.items.first.createdAt;
      final page = await _server.call(room, before: before);
      state = state.copyWith(
        items: [...page.messages, ...state.items],
        hasMore: page.hasMore,
        isLoadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  Future<void> refresh() => _initialLoad();

  void appendLive(RoomMessage message) {
    if (state.items.any((m) => m.id == message.id)) return;
    state = state.copyWith(items: [...state.items, message]);
  }

  /// "Delete for me" (CROSS-024): drop the row from this viewer's list.
  void removeMessage(String messageId) {
    if (!state.items.any((m) => m.id == messageId)) return;
    state = state.copyWith(
      items: state.items.where((m) => m.id != messageId).toList(),
    );
  }

  /// "Delete for everyone" (CROSS-024): tombstone in place — order and
  /// length are kept so the list doesn't jump.
  void markDeleted(String messageId, String deletedAt) {
    if (!state.items.any((m) => m.id == messageId)) return;
    state = state.copyWith(
      items: [
        for (final m in state.items)
          if (m.id == messageId)
            m.copyWith(deletedAt: deletedAt, clearContent: true)
          else
            m,
      ],
    );
  }
}
