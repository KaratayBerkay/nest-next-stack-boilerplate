import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/notifications/mark_read.dart';
import '../../server/notifications/read.dart';

final notificationActionsProvider = Provider((ref) => NotificationActions(ref));

class NotificationActions {
  final Ref _ref;

  NotificationActions(this._ref);

  Future<void> markRead(String notificationId) async {
    final server = _ref.read(notificationsMarkReadServerProvider);
    await server.call(notificationId);
  }

  Future<void> markAllRead() async {
    final server = _ref.read(notificationReadServerProvider);
    await server.markAllRead();
  }
}
