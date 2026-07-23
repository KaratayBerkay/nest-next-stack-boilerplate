import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/admin/set_tier.dart';

final adminActionsProvider = Provider((ref) => AdminActions(ref));

class AdminActions {
  final Ref _ref;

  AdminActions(this._ref);

  Future<void> setTier(String userId, String tier) async {
    final server = _ref.read(adminSetTierServerProvider);
    await server.call(userId, tier);
  }
}
