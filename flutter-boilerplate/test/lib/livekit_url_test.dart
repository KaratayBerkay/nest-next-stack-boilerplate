import 'package:flutter_boilerplate/app_config.dart';
import 'package:flutter_boilerplate/lib/rtc/livekit_url.dart';
import 'package:flutter_boilerplate/types/rtc/active_call_snapshot.dart';
import 'package:flutter_boilerplate/types/rtc/meeting.dart';
import 'package:flutter_boilerplate/types/rtc/stream.dart';
import 'package:flutter_test/flutter_test.dart';

// MOB-034: every call/meeting/stream connected to AppConfig.livekitUrl, whose
// default is ws://localhost:7880 — the device's own loopback. The backend now
// stamps its client-facing URL on every join result / call frame and the app
// prefers it; the compile-time value is only the fallback.
void main() {
  group('resolveLivekitUrl', () {
    test('prefers the server-supplied URL', () {
      expect(
        resolveLivekitUrl('wss://livekit.example.com'),
        'wss://livekit.example.com',
      );
      expect(
        resolveLivekitUrl('  wss://livekit.example.com  '),
        'wss://livekit.example.com',
      );
    });

    test('falls back to AppConfig.livekitUrl when the server sent none', () {
      expect(resolveLivekitUrl(null), AppConfig.livekitUrl);
      expect(resolveLivekitUrl(''), AppConfig.livekitUrl);
      expect(resolveLivekitUrl('   '), AppConfig.livekitUrl);
    });
  });

  group('join results parse livekitUrl', () {
    const meetingJson = {
      'id': 'm1',
      'title': 'Standup',
      'slug': 'abc',
      'maxParticipants': 5,
      'maxDurationMinutes': 60,
      'createdAt': '2026-09-01T10:00:00.000Z',
      'room': {
        'id': 'r1',
        'state': 'ACTIVE',
        'startedAt': null,
        'endedAt': null,
      },
      'host': {
        'id': 'u1',
        'name': 'Ada',
        'email': 'ada@example.com',
        'avatarUrl': null,
      },
    };

    test('JoinMeetingResult keeps a present livekitUrl and tolerates null', () {
      final withUrl = JoinMeetingResult.fromJson({
        'token': 't',
        'roomName': 'meeting-x',
        'livekitUrl': 'wss://livekit.example.com',
        'role': 'HOST',
        'meeting': meetingJson,
      });
      expect(withUrl.livekitUrl, 'wss://livekit.example.com');

      final withoutUrl = JoinMeetingResult.fromJson({
        'token': 't',
        'roomName': 'meeting-x',
        'livekitUrl': null,
        'role': 'HOST',
        'meeting': meetingJson,
      });
      expect(withoutUrl.livekitUrl, isNull);
    });

    test('ActiveCallSnapshot parses livekitUrl', () {
      final snapshot = ActiveCallSnapshot.fromJson({
        'type': 'rtc:accepted',
        'callId': 'c1',
        'token': 't',
        'roomName': 'call-x',
        'livekitUrl': 'wss://livekit.example.com',
      });
      expect(snapshot.livekitUrl, 'wss://livekit.example.com');
    });

    test('LiveStreamJoinResult is optional-safe for livekitUrl', () {
      expect(
        () => LiveStreamJoinResult.fromJson({
          'token': 't',
          'roomName': 'stream-x',
          'stream': _streamJson,
        }),
        returnsNormally,
      );
    });
  });
}

const _streamJson = {
  'id': 's1',
  'title': 'Live',
  'slug': 'live-1',
  'isLive': true,
  'peakViewerCount': 0,
  'viewerCount': 0,
  'startedAt': '2026-09-01T10:00:00.000Z',
  'endedAt': null,
  'room': {'id': 'r1', 'state': 'ACTIVE', 'startedAt': null, 'endedAt': null},
  'broadcaster': {
    'id': 'u1',
    'name': 'Ada',
    'email': 'ada@example.com',
    'avatarUrl': null,
  },
};
