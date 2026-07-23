import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/notifications/mark_read.dart';

final markReadNotificationsProvider = Provider((ref) => MarkReadNotifications(ref));

class MarkReadNotifications {
  final Ref _ref;

  MarkReadNotifications(this._ref);

  Future<void> call(String notificationId) async {
    final server = _ref.read(notificationsMarkReadServerProvider);
    await server.call(notificationId);
  }
}
