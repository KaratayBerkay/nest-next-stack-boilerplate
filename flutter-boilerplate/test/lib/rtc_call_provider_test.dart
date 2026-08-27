import 'package:fake_async/fake_async.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_state.dart';
import 'package:flutter_boilerplate/types/rtc/active_call_snapshot.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockRealtimeClient extends Mock implements RealtimeClient {}

const _peer = RtcCallPeer(id: 'peer-1', name: 'Alice');

void main() {
  setUpAll(() {
    registerFallbackValue(<String, dynamic>{});
  });

  late _MockRealtimeClient client;

  ProviderContainer makeContainer({
    RealtimeStatus status = RealtimeStatus.open,
  }) {
    client = _MockRealtimeClient();
    final container = ProviderContainer(
      overrides: [
        realtimeProvider.overrideWithValue(client),
        realtimeStatusProvider.overrideWith((ref) => status),
      ],
    );
    addTearDown(container.dispose);
    return container;
  }

  List<Map<String, dynamic>> sentFrames() =>
      verify(() => client.send(captureAny()))
          .captured
          .cast<Map<String, dynamic>>();

  group('startCall', () {
    test('sends rtc:invite and enters outgoing-ringing when WS is open', () {
      final container = makeContainer();
      container.read(rtcCallProvider.notifier).startCall(_peer, true);

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.outgoingRinging);
      expect(state.peer?.id, 'peer-1');
      expect(state.hasVideo, isTrue);

      final frames = sentFrames();
      expect(frames, hasLength(1));
      expect(frames.first['type'], 'rtc:invite');
      expect(frames.first['calleeId'], 'peer-1');
    });

    test('is ignored while a call is already in progress', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.onIncoming('c1', _peer, false);

      notifier.startCall(const RtcCallPeer(id: 'other', name: 'Bob'), true);

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.incomingRinging);
      expect(state.callId, 'c1');
      verifyNever(() => client.send(any()));
    });

    test('surfaces realtime_unavailable instead of failing silently', () {
      final container = makeContainer(status: RealtimeStatus.down);
      container.read(rtcCallProvider.notifier).startCall(_peer, false);

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.idle);
      expect(state.lastError, 'realtime_unavailable');
      verifyNever(() => client.send(any()));
    });
  });

  group('acceptCall', () {
    test('sets actionPending and sends rtc:accept exactly once', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.onIncoming('c1', _peer, true);

      notifier.acceptCall();
      // A second tap while the ack is pending must not re-send.
      notifier.acceptCall();

      final state = container.read(rtcCallProvider);
      expect(state.actionPending, RtcCallAction.accept);
      final accepts =
          sentFrames().where((f) => f['type'] == 'rtc:accept').toList();
      expect(accepts, hasLength(1));
      expect(accepts.first['callId'], 'c1');
    });

    test('does nothing outside incoming-ringing', () {
      final container = makeContainer();
      container.read(rtcCallProvider.notifier).acceptCall();
      expect(container.read(rtcCallProvider).phase, RtcCallPhase.idle);
      verifyNever(() => client.send(any()));
    });

    test('a dropped ack frame times out into a visible error', () {
      fakeAsync((async) {
        final container = makeContainer();
        final notifier = container.read(rtcCallProvider.notifier);
        notifier.onIncoming('c1', _peer, true);
        notifier.acceptCall();

        async.elapse(const Duration(seconds: 11));

        final state = container.read(rtcCallProvider);
        expect(state.phase, RtcCallPhase.idle);
        expect(state.lastError, 'action_timeout');
      });
    });

    test('onAccepted clears the pending action and connects', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.onIncoming('c1', _peer, true);
      notifier.acceptCall();

      notifier.onAccepted('c1', 'token', 'room-1', 30);

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.connected);
      expect(state.actionPending, isNull);
      expect(state.livekit?.token, 'token');
    });
  });

  group('cancelCall before the callId arrives', () {
    test('marks cancel pending, then cancels as soon as ringing lands', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.startCall(_peer, false);

      // The rtc:ringing frame (which carries the callId) hasn't arrived yet.
      notifier.cancelCall();
      var state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.outgoingRinging);
      expect(state.actionPending, RtcCallAction.cancel);
      expect(
        sentFrames().where((f) => f['type'] == 'rtc:cancel'),
        isEmpty,
      );

      notifier.onRinging('c9');

      state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.idle);
      final cancels =
          sentFrames().where((f) => f['type'] == 'rtc:cancel').toList();
      expect(cancels, hasLength(1));
      expect(cancels.first['callId'], 'c9');
    });

    test('cancel with a known callId sends and resets immediately', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.startCall(_peer, false);
      notifier.onRinging('c2');

      notifier.cancelCall();

      expect(container.read(rtcCallProvider).phase, RtcCallPhase.idle);
      expect(
        sentFrames().where((f) => f['type'] == 'rtc:cancel'),
        hasLength(1),
      );
    });
  });

  group('rejectCall', () {
    test('sends rtc:reject and resets from incoming-ringing', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.onIncoming('c1', _peer, false);

      notifier.rejectCall();

      expect(container.read(rtcCallProvider).phase, RtcCallPhase.idle);
      expect(
        sentFrames().where((f) => f['type'] == 'rtc:reject'),
        hasLength(1),
      );
    });

    test('is a no-op while an accept is pending', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.onIncoming('c1', _peer, false);
      notifier.acceptCall();

      notifier.rejectCall();

      expect(
        container.read(rtcCallProvider).phase,
        RtcCallPhase.incomingRinging,
      );
      expect(sentFrames().where((f) => f['type'] == 'rtc:reject'), isEmpty);
    });
  });

  group('lifecycle frames', () {
    test('onEnded resets state for the matching call', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.onIncoming('c1', _peer, false);

      notifier.onEnded('other-call');
      expect(
        container.read(rtcCallProvider).phase,
        RtcCallPhase.incomingRinging,
      );

      notifier.onEnded('c1', reason: 'cancelled');
      expect(container.read(rtcCallProvider).phase, RtcCallPhase.idle);
    });

    test('onCallError resets and records lastError; dismissError clears', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.startCall(_peer, false);
      notifier.onRinging('c1');

      notifier.onCallError('c1', 'callee_offline');

      var state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.idle);
      expect(state.lastError, 'callee_offline');

      notifier.dismissError();
      state = container.read(rtcCallProvider);
      expect(state.lastError, isNull);
    });
  });

  group('applySnapshot', () {
    test('recovers a missed rtc:invite as incoming-ringing', () {
      final container = makeContainer();
      container.read(rtcCallProvider.notifier).applySnapshot(
            ActiveCallSnapshot(
              type: 'rtc:invite',
              callId: 'c1',
              callerId: 'peer-1',
              callerName: 'Alice',
              hasVideo: true,
            ),
          );

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.incomingRinging);
      expect(state.callId, 'c1');
      expect(state.hasVideo, isTrue);
    });

    test('recovers a missed rtc:accepted as connected', () {
      final container = makeContainer();
      container.read(rtcCallProvider.notifier).applySnapshot(
            ActiveCallSnapshot(
              type: 'rtc:accepted',
              callId: 'c2',
              token: 'tok',
              roomName: 'room-2',
              peerId: 'peer-1',
              peerName: 'Alice',
            ),
          );

      final state = container.read(rtcCallProvider);
      expect(state.phase, RtcCallPhase.connected);
      expect(state.livekit?.roomName, 'room-2');
      expect(state.peer?.id, 'peer-1');
    });

    test('never clobbers a live call', () {
      final container = makeContainer();
      final notifier = container.read(rtcCallProvider.notifier);
      notifier.onIncoming('live-call', _peer, false);

      notifier.applySnapshot(
        ActiveCallSnapshot(
          type: 'rtc:invite',
          callId: 'stale-call',
          callerId: 'someone-else',
        ),
      );

      expect(container.read(rtcCallProvider).callId, 'live-call');
    });
  });

  group('RtcCallState.copyWith actionPending sentinel', () {
    test('omitting keeps, explicit null clears', () {
      const pending = RtcCallState(
        phase: RtcCallPhase.incomingRinging,
        callId: 'c1',
        actionPending: RtcCallAction.accept,
      );

      expect(
        pending.copyWith(callId: 'c2').actionPending,
        RtcCallAction.accept,
      );
      expect(pending.copyWith(actionPending: null).actionPending, isNull);
      expect(
        pending.copyWith(actionPending: RtcCallAction.hangup).actionPending,
        RtcCallAction.hangup,
      );
    });
  });
}
