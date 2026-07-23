import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/notifications/list.dart';
import '../../server/notifications/unread_count.dart';
import '../../server/notifications/dm_unread_count.dart';

final notificationsProvider = FutureProvider((ref) async {
  final server = ref.read(notificationsServerProvider);
  return server.call();
});

final notificationsUnreadCountProvider = FutureProvider((ref) async {
  final server = ref.read(notificationsUnreadCountServerProvider);
  return server.call();
});

final dmUnreadNotificationsProvider = FutureProvider((ref) async {
  final server = ref.read(dmUnreadNotificationsServerProvider);
  return server.call();
});
