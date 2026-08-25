import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/recording.dart';
import '../../../types/rtc/stream.dart';
import '../../server/rtc/streams_end.dart';
import '../../server/rtc/streams_go_live.dart';
import '../../server/rtc/streams_join.dart';
import '../../server/rtc/streams_leave.dart';
import '../../server/rtc/streams_recording.dart';
import '../../server/rtc/streams_report.dart';

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

  Future<void> report(
    String slug,
    String reason, {
    String? details,
    String? reportedUserId,
  }) =>
      _ref.read(reportStreamServerProvider).call(
            slug,
            reason,
            details: details,
            reportedUserId: reportedUserId,
          );

  Future<RtcRecording?> recordingStatus(String slug) =>
      _ref.read(streamRecordingServerProvider).get(slug);

  Future<RtcRecording> startRecording(String slug) =>
      _ref.read(streamRecordingServerProvider).start(slug);

  Future<RtcRecording> stopRecording(String slug) =>
      _ref.read(streamRecordingServerProvider).stop(slug);
}
