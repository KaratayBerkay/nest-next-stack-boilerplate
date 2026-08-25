import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/rtc/calls_report.dart';

final callActionsProvider = Provider((ref) => CallActions(ref));

class CallActions {
  final Ref _ref;

  CallActions(this._ref);

  Future<void> report(String callId, String reason, {String? details}) => _ref
      .read(reportCallServerProvider)
      .call(callId, reason, details: details);
}
