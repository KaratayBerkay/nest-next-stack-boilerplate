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
}
