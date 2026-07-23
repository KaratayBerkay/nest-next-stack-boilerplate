import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/observability/index.dart';

final observabilityActionsProvider = Provider((ref) => ObservabilityActions(ref));

class ObservabilityActions {
  final Ref _ref;

  ObservabilityActions(this._ref);

  Future<Map<String, dynamic>> report(Map<String, dynamic> metrics) async {
    final server = _ref.read(observabilityServerProvider);
    return server.report(metrics);
  }
}
