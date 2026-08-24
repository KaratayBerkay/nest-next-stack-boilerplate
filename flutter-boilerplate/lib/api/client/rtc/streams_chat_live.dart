import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../../types/rtc/stream.dart';
import '../../server/rtc/streams_chat.dart';

/// Stream-chat analog of meetingChatProvider — same shape (initial load +
/// appendLive), same `ref.exists` guard in handleEventFrame's shared
/// rtc:chat-message case (see meetingChatProvider's doc comment).
final streamChatProvider = StateNotifierProvider.family<StreamChatNotifier,
    PaginatedListState<StreamChatMessage>, String>(
  (ref, slug) => StreamChatNotifier(ref.read(streamChatServerProvider), slug),
);

class StreamChatNotifier
    extends StateNotifier<PaginatedListState<StreamChatMessage>> {
  final StreamChatServer _server;
  final String slug;

  StreamChatNotifier(this._server, this.slug)
      : super(const PaginatedListState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = const PaginatedListState();
    try {
      final page = await _server.call(slug);
      state = PaginatedListState(
        items: page.messages.reversed.toList(),
        hasMore: page.hasMore,
        isInitialLoading: false,
      );
    } catch (e) {
      state = PaginatedListState(error: e.toString(), isInitialLoading: false);
    }
  }

  void appendLive(StreamChatMessage message) {
    if (state.items.any((m) => m.id == message.id)) return;
    state = state.copyWith(items: [...state.items, message]);
  }
}
