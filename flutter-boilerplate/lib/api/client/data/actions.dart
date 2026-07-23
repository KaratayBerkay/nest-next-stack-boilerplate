import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/data/index.dart';

final dataActionsProvider = Provider((ref) => DataActions(ref));

class DataActions {
  final Ref _ref;

  DataActions(this._ref);

  Future<void> set(String key, Map<String, dynamic> value) async {
    final server = _ref.read(dataServerProvider);
    await server.set(key, value);
  }
}
