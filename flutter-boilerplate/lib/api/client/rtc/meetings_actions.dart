import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/meeting.dart';
import '../../server/rtc/meetings_create.dart';
import '../../server/rtc/meetings_end.dart';
import '../../server/rtc/meetings_join.dart';
import '../../server/rtc/meetings_leave.dart';
import '../../server/rtc/meetings_participants.dart';

final meetingActionsProvider = Provider((ref) => MeetingActions(ref));

class MeetingActions {
  final Ref _ref;

  MeetingActions(this._ref);

  Future<Meeting> create(String title) =>
      _ref.read(createMeetingServerProvider).call(title);

  Future<JoinMeetingResult> join(String slug) =>
      _ref.read(joinMeetingServerProvider).call(slug);

  Future<void> leave(String slug) =>
      _ref.read(leaveMeetingServerProvider).call(slug);

  Future<void> end(String slug) =>
      _ref.read(endMeetingServerProvider).call(slug);

  Future<void> muteParticipant(String slug, String userId, bool muted) =>
      _ref.read(meetingParticipantsServerProvider).mute(slug, userId, muted);

  Future<void> removeParticipant(String slug, String userId) =>
      _ref.read(meetingParticipantsServerProvider).remove(slug, userId);
}
