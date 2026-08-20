import 'package:flutter_boilerplate/lib/pagination_state.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../../types/notification/notification_item.dart';
import '../../server/notifications/dm_unread_count.dart';
import '../../server/notifications/list.dart';
import '../../server/notifications/unread_count.dart';

const _notificationsPageSize = 20;

final notificationsUnreadCountProvider = FutureProvider((ref) async {
  final server = ref.read(notificationsUnreadCountServerProvider);
  return server.call();
});

final dmUnreadNotificationsProvider = FutureProvider((ref) async {
  final server = ref.read(dmUnreadNotificationsServerProvider);
  return server.call();
});

/// `items` is newest-first (no reversal, unlike the message-history
/// pagination) — `loadMore()` and a live `Item` push both append.
final notificationsProvider = StateNotifierProvider<
    PaginatedNotificationsNotifier, PaginatedListState<NotificationItem>>(
  (ref) =>
      PaginatedNotificationsNotifier(ref.read(notificationsServerProvider)),
);

class PaginatedNotificationsNotifier
    extends StateNotifier<PaginatedListState<NotificationItem>> {
  final NotificationsServer _server;

  PaginatedNotificationsNotifier(this._server)
      : super(const PaginatedListState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = const PaginatedListState();
    try {
      final page = await _server.call(take: _notificationsPageSize);
      state = PaginatedListState(
        items: page.items,
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
      final page = await _server.call(
        cursor: state.items.last.id,
        take: _notificationsPageSize,
      );
      state = state.copyWith(
        items: [...state.items, ...page.items],
        hasMore: page.hasMore,
        isLoadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  Future<void> refresh() => _initialLoad();

  void prependLive(NotificationItem item) {
    if (state.items.any((n) => n.id == item.id)) return;
    state = state.copyWith(items: [item, ...state.items]);
  }
}
