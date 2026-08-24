import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/stream.dart';
import '../../server/rtc/streams_end.dart';
import '../../server/rtc/streams_go_live.dart';
import '../../server/rtc/streams_join.dart';
import '../../server/rtc/streams_leave.dart';

final streamActionsProvider = Provider((ref) => StreamActions(ref));

class StreamActions {
  final Ref _ref;

  StreamActions(this._ref);

  Future<LiveStreamJoinResult> goLive(String title) =>
      _ref.read(goLiveServerProvider).call(title);

  Future<LiveStreamJoinResult> join(String slug) =>
      _ref.read(joinStreamServerProvider).call(slug);

  Future<void> leave(String slug) =>
      _ref.read(leaveStreamServerProvider).call(slug);

  Future<void> end(String slug) =>
      _ref.read(endStreamServerProvider).call(slug);
}
