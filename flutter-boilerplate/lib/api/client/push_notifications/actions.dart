import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/push_notifications/subscribe.dart';
import '../../server/push_notifications/unsubscribe.dart';

final pushActionsProvider = Provider((ref) => PushActions(ref));

class PushActions {
  final Ref _ref;

  PushActions(this._ref);

  Future<void> subscribe(String token) async {
    final server = _ref.read(pushSubscribeServerProvider);
    await server.call(token);
  }

  Future<void> unsubscribe(String token) async {
    final server = _ref.read(pushUnsubscribeServerProvider);
    await server.call(token);
  }
}
