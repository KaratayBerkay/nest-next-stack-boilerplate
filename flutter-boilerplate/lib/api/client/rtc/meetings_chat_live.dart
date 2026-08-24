import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../../types/rtc/meeting.dart';
import '../../server/rtc/meetings_chat.dart';

/// Mirrors PaginatedRoomMessagesNotifier's shape exactly (initial load +
/// appendLive for a just-arrived WS message) — the meeting-chat analog of
/// chat-room's own live message list. `handleEventFrame`'s `rtc:chat-message`
/// case only patches this if a widget is already watching this slug (via
/// `ref.exists`), same guard messaging's own room-message case uses.
final meetingChatProvider = StateNotifierProvider.family<MeetingChatNotifier,
    PaginatedListState<MeetingChatMessage>, String>(
  (ref, slug) => MeetingChatNotifier(ref.read(meetingChatServerProvider), slug),
);

class MeetingChatNotifier
    extends StateNotifier<PaginatedListState<MeetingChatMessage>> {
  final MeetingChatServer _server;
  final String slug;

  MeetingChatNotifier(this._server, this.slug)
      : super(const PaginatedListState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = const PaginatedListState();
    try {
      final page = await _server.call(slug);
      // Backend returns newest-first; chat renders chronologically.
      state = PaginatedListState(
        items: page.messages.reversed.toList(),
        hasMore: page.hasMore,
        isInitialLoading: false,
      );
    } catch (e) {
      state = PaginatedListState(error: e.toString(), isInitialLoading: false);
    }
  }

  void appendLive(MeetingChatMessage message) {
    if (state.items.any((m) => m.id == message.id)) return;
    state = state.copyWith(items: [...state.items, message]);
  }
}
