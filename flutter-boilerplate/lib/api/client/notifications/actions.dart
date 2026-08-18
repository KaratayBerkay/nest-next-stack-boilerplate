import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/notifications/mark_read.dart';
import '../../server/notifications/read.dart';
import 'query.dart';

final notificationActionsProvider = Provider((ref) => NotificationActions(ref));

class NotificationActions {
  final Ref _ref;

  NotificationActions(this._ref);

  Future<void> markRead(String notificationId) async {
    final server = _ref.read(notificationsMarkReadServerProvider);
    await server.call(notificationId);
    _invalidate();
  }

  Future<void> markAllRead() async {
    final server = _ref.read(notificationReadServerProvider);
    await server.markAllRead();
    _invalidate();
  }

  // Mirrors both the web's useNotificationActions() (invalidates
  // ["notifications"] after markRead/markAllRead) and this app's own
  // realtime_provider.dart handleRenewFrame's `Notifications`/`Read` case —
  // same two providers, so a local mark-read and a synced one from another
  // device converge on identical UI state.
  void _invalidate() {
    _ref.invalidate(notificationsProvider);
    _ref.invalidate(notificationsUnreadCountProvider);
  }
}
