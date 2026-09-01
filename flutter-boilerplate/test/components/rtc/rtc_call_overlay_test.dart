import 'package:flutter_boilerplate/components/rtc/rtc_call_overlay.dart';
import 'package:flutter_boilerplate/l10n/app_localizations_en.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('callErrorMessage', () {
    final t = AppLocalizationsEn();

    test('maps each stable backend reason code to its localized copy', () {
      expect(callErrorMessage('callee_offline', t), t.rtcUserOffline);
      expect(callErrorMessage('busy', t), t.rtcUserBusy);
      expect(callErrorMessage('self_call', t), t.rtcCannotCallSelf);
      expect(callErrorMessage('call_unavailable', t), t.rtcCallUnavailable);
      expect(
        callErrorMessage('realtime_unavailable', t),
        t.rtcConnectionUnavailable,
      );
      expect(
        callErrorMessage('action_timeout', t),
        t.rtcConnectionUnavailable,
      );
    });

    test('falls back to the generic description for unknown reasons', () {
      expect(
        callErrorMessage('some_future_reason', t),
        t.rtcCallErrorDescription,
      );
    });
  });

  // Mirror of the web overlay's formatCallTimer: the tier-scaled duration
  // cap (10/25/45/120 min, min of the two parties) must be visible during
  // the call as "elapsed / limit".
  group('formatCallTimer', () {
    test('formats elapsed / limit when a cap is known', () {
      expect(formatCallTimer(137, 10), '2:17 / 10:00');
      expect(formatCallTimer(0, 25), '0:00 / 25:00');
      expect(formatCallTimer(3599, 120), '59:59 / 120:00');
    });

    test('falls back to elapsed alone without a cap', () {
      expect(formatCallTimer(137, null), '2:17');
      expect(formatCallTimer(137, 0), '2:17');
    });
  });

  // Same "camera never disappears behind the share" mechanics as the
  // meeting room's buildMeetingStageTiles, applied to 1:1 calls.
  group('resolveActiveCallShare', () {
    test('nobody sharing stays on the camera stage', () {
      expect(
        resolveActiveCallShare(remoteSharing: false, localSharing: false),
        isNull,
      );
    });

    test('the peer sharing takes the main stage', () {
      expect(
        resolveActiveCallShare(remoteSharing: true, localSharing: false),
        CallShareSource.remote,
      );
    });

    test('you sharing takes the main stage', () {
      expect(
        resolveActiveCallShare(remoteSharing: false, localSharing: true),
        CallShareSource.local,
      );
    });

    test('the peer wins the main stage if both happen to share at once', () {
      expect(
        resolveActiveCallShare(remoteSharing: true, localSharing: true),
        CallShareSource.remote,
      );
    });
  });
}
