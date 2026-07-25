import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/activity/log.dart';

final activityLogActionsProvider = Provider((ref) => ActivityLogActions(ref));

class ActivityLogActions {
  final Ref _ref;

  ActivityLogActions(this._ref);

  Future<void> logEvents(List<Map<String, dynamic>> events) async {
    final server = _ref.read(activityLogServerProvider);
    await server.call(events);
  }
}
