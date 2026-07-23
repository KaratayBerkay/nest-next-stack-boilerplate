import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/api_keys/create.dart';
import '../../server/api_keys/revoke.dart';

final apiKeyActionsProvider = Provider((ref) => ApiKeyActions(ref));

class ApiKeyActions {
  final Ref _ref;

  ApiKeyActions(this._ref);

  Future<Map<String, dynamic>> create(String name) async {
    final server = _ref.read(apiKeyCreateServerProvider);
    return server.call(name);
  }

  Future<void> revoke(String keyId) async {
    final server = _ref.read(apiKeyRevokeServerProvider);
    await server.call(keyId);
  }
}
