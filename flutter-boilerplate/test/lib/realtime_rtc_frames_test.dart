import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockRealtimeClient extends Mock implements RealtimeClient {}

final _refProvider = Provider<Ref>((ref) => ref);

void main() {
  setUpAll(() {
    registerFallbackValue(<String, dynamic>{});
  });

  group('handleEventFrame rtc:* call frames', () {
    late ProviderContainer container;

    setUp(() {
      container = ProviderContainer(
        overrides: [
          realtimeProvider.overrideWithValue(_MockRealtimeClient()),
          realtimeStatusProvider.overrideWith((ref) => RealtimeStatus.open),
        ],
      );
      addTearDown(container.dispose);
    });

    test('rtc:invite dispatches into the call notifier', () {
      handleEventFrame(container.read(_refProvider), {
        'type': 'rtc:invite',
        'callId': 'c1',
        'callerId': 'peer-1',
        'callerName': 'Alice',
        'hasVideo': true,
      });

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.incomingRinging);
      expect(state.callId, 'c1');
      expect(state.peer?.name, 'Alice');
    });

    test('rtc:rejected ends the call with the un-prefixed reason', () {
      container.read(rtcCallProvider.notifier).onIncoming(
            'c1',
            const RtcCallPeer(id: 'peer-1', name: 'Alice'),
            false,
          );

      handleEventFrame(container.read(_refProvider), {
        'type': 'rtc:rejected',
        'callId': 'c1',
      });

      expect(container.read(rtcCallProvider).phase, RtcCallPhase.idle);
    });

    test('rtc:error resets the call and records the reason', () {
      container.read(rtcCallProvider.notifier).onIncoming(
            'c1',
            const RtcCallPeer(id: 'peer-1', name: 'Alice'),
            false,
          );

      handleEventFrame(container.read(_refProvider), {
        'type': 'rtc:error',
        'callId': 'c1',
        'reason': 'busy',
      });

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.idle);
      expect(state.lastError, 'busy');
    });
  });
}
