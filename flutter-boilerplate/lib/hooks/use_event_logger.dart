import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/client/events/actions.dart';

final eventLoggerProvider = Provider((ref) => EventLogger(ref));

class EventLogger {
  final Ref _ref;

  EventLogger(this._ref);

  Future<void> log({
    required String category,
    required String action,
    String? label,
    Map<String, dynamic>? metadata,
  }) async {
    final event =
        label != null ? '$category.$action.$label' : '$category.$action';
    await _ref.read(eventsActionsProvider).log(event, metadata);
  }
}
