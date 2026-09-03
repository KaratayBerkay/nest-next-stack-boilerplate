import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/l10n/app_localizations_en.dart';
import 'package:flutter_boilerplate/views/rtc/meeting_room_page_view.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:livekit_client/livekit_client.dart' as lk;
import 'package:mocktail/mocktail.dart';

class _MockVideoTrack extends Mock implements lk.VideoTrack {}

MeetingParticipantView _participant({
  required String identity,
  bool sharingScreen = false,
  bool isLocal = false,
}) {
  return MeetingParticipantView(
    identity: identity,
    name: identity,
    isLocal: isLocal,
    videoTrack: _MockVideoTrack(),
    screenShareTrack: sharingScreen ? _MockVideoTrack() : null,
    micEnabled: true,
    cameraEnabled: true,
    screenShareEnabled: sharingScreen,
  );
}

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

    // BE-031: removal is a ban, so the removed user's rejoin 403s with
    // EX_MEETING_REMOVED — final, not a retry prompt.
    test('maps a 403 carrying EX_MEETING_REMOVED to the removed screen', () {
      expect(
        roomPhaseForJoinFailure(403, exc: kMeetingRemovedExc),
        RoomPhase.removed,
      );
      // A capacity 403 stays a plain join failure.
      expect(
        roomPhaseForJoinFailure(403, exc: 'EX_MEETING_FULL'),
        RoomPhase.joinFailed,
      );
    });

    test('joinFailureExc reads the exc code off the join error body', () {
      final options = RequestOptions(path: '/graphql');
      final removed = DioException(
        requestOptions: options,
        response: Response(
          requestOptions: options,
          statusCode: 403,
          data: {'exc': kMeetingRemovedExc},
        ),
      );
      expect(joinFailureExc(removed), kMeetingRemovedExc);
      expect(
        joinFailureExc(DioException(requestOptions: options)),
        isNull,
      );
      expect(joinFailureExc(StateError('x')), isNull);
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

  group('buildMeetingStageTiles', () {
    test('one camera tile per participant when nobody is sharing', () {
      final tiles = buildMeetingStageTiles([
        _participant(identity: 'u1', isLocal: true),
        _participant(identity: 'u2'),
      ]);

      expect(tiles.map((tile) => tile.key), ['u1', 'u2']);
      expect(
        tiles.every((tile) => tile.mode == MeetingStageVideoMode.camera),
        isTrue,
      );
    });

    test(
        'a presenter gets a screen tile AND keeps their camera tile — the '
        'camera must never disappear behind the shared screen', () {
      final tiles = buildMeetingStageTiles([
        _participant(identity: 'u1'),
        _participant(identity: 'u2', sharingScreen: true),
      ]);

      expect(tiles.map((tile) => tile.key), ['u1', 'u2::screen', 'u2']);
      expect(tiles[1].mode, MeetingStageVideoMode.screen);
      expect(tiles[1].participant.identity, 'u2');
      expect(tiles[2].mode, MeetingStageVideoMode.camera);
      expect(tiles[2].participant.identity, 'u2');
    });
  });
}
