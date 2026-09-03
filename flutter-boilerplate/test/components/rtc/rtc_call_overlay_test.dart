import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/rtc/query.dart';
import 'package:flutter_boilerplate/components/rtc/rtc_call_overlay.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/l10n/app_localizations_en.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeIncomingCallNotifier extends RtcCallNotifier {
  _FakeIncomingCallNotifier(super.ref) {
    state = const RtcCallState(
      phase: RtcCallPhase.incomingRinging,
      peer: RtcCallPeer(id: 'peer-1', name: 'Test Peer'),
    );
  }
}

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

  // Regression (MOB-033): app.dart used to mount RtcCallOverlay as a Stack
  // *sibling* of MaterialApp.router's own `child` — the subtree holding the
  // real Navigator/Overlay — instead of a descendant of it. Every call
  // action button routes through the shared _CallActionButton, which always
  // wraps itself in a Tooltip, and Tooltip needs Overlay.of(context) — so
  // the incoming-call sheet crashed instantly with "No Overlay widget
  // found" the moment it tried to render, and the callee had no way to
  // accept or decline. Fixed by giving the overlay its own Overlay ancestor
  // at the same mount point; this test reproduces that exact mount shape.
  group('mount point', () {
    testWidgets(
        'incoming-call sheet renders without a Tooltip/Overlay crash at the '
        'app.dart mount point', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            rtcCallProvider.overrideWith(_FakeIncomingCallNotifier.new),
            activeCallProvider.overrideWith((ref) async => null),
          ],
          child: MaterialApp(
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: const [Locale('en'), Locale('tr')],
            home: Builder(
              builder: (context) => Stack(
                children: [
                  const SizedBox.expand(),
                  Positioned.fill(
                    child: Overlay(
                      initialEntries: [
                        OverlayEntry(builder: (_) => const RtcCallOverlay()),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.byType(Tooltip), findsWidgets);
      expect(find.text('Test Peer'), findsOneWidget);
    });
  });
}
