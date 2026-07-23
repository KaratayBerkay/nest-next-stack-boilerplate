import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/events/log.dart';

final eventsActionsProvider = Provider((ref) => EventsActions(ref));

class EventsActions {
  final Ref _ref;

  EventsActions(this._ref);

  Future<void> log(String event, Map<String, dynamic>? properties) async {
    final server = _ref.read(eventsLogServerProvider);
    await server.call(event, properties);
  }
}
