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
}
