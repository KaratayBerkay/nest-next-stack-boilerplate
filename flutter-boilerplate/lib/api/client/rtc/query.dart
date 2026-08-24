import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../../types/rtc/active_call_snapshot.dart';
import '../../../types/rtc/call_history_entry.dart';
import '../../server/rtc/active_call.dart';
import '../../server/rtc/call_history.dart';

final activeCallProvider = FutureProvider<ActiveCallSnapshot?>((ref) async {
  final server = ref.read(activeCallServerProvider);
  return server.call();
});

final callHistoryProvider = StateNotifierProvider<CallHistoryNotifier,
    PaginatedListState<CallHistoryEntry>>(
  (ref) => CallHistoryNotifier(ref.read(callHistoryServerProvider)),
);

class CallHistoryNotifier
    extends StateNotifier<PaginatedListState<CallHistoryEntry>> {
  final CallHistoryServer _server;

  CallHistoryNotifier(this._server) : super(const PaginatedListState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = const PaginatedListState();
    try {
      final page = await _server.call();
      state = PaginatedListState(
        items: page.calls,
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
      final before = state.items.last.ringingAt.toIso8601String();
      final page = await _server.call(before: before);
      state = state.copyWith(
        items: [...state.items, ...page.calls],
        hasMore: page.hasMore,
        isLoadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  Future<void> refresh() => _initialLoad();
}
