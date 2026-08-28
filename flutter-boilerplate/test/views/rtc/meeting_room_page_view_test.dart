import 'package:flutter_boilerplate/l10n/app_localizations_en.dart';
import 'package:flutter_boilerplate/views/rtc/meeting_room_page_view.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final t = AppLocalizationsEn();

  group('roomPhaseForJoinFailure', () {
    test('maps 404 to not-found (meeting gone or already over)', () {
      expect(roomPhaseForJoinFailure(404), RoomPhase.notFound);
    });

    test(
        'maps every non-404 failure to joinFailed — a server error must '
        'never render as "the meeting has ended"', () {
      expect(roomPhaseForJoinFailure(500), RoomPhase.joinFailed);
      expect(roomPhaseForJoinFailure(403), RoomPhase.joinFailed);
      expect(roomPhaseForJoinFailure(null), RoomPhase.joinFailed);
    });
  });

  group('roomPhaseMessage', () {
    test('joinFailed shows the join-failure copy, not the ended notice', () {
      expect(roomPhaseMessage(RoomPhase.joinFailed, t), t.rtcJoinMeetingFailed);
    });

    test('remaining phases keep their copy', () {
      expect(roomPhaseMessage(RoomPhase.notFound, t), t.rtcMeetingNotFound);
      expect(
        roomPhaseMessage(RoomPhase.removed, t),
        t.rtcMeetingRemovedNotice,
      );
      expect(roomPhaseMessage(RoomPhase.ended, t), t.rtcMeetingEndedNotice);
    });
  });
}
