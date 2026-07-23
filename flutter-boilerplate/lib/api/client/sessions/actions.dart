import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/sessions/revoke.dart';
import '../../server/sessions/revoke_others.dart';

final sessionActionsProvider = Provider((ref) => SessionActions(ref));

class SessionActions {
  final Ref _ref;

  SessionActions(this._ref);

  Future<void> revoke(String sessionId) async {
    final server = _ref.read(revokeSessionServerProvider);
    await server.call(sessionId);
  }

  Future<void> revokeOthers() async {
    final server = _ref.read(revokeOthersServerProvider);
    await server.call();
  }
}
