import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('realtimeConnectedProvider', () {
    test('defaults to false', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(realtimeConnectedProvider), isFalse);
    });
  });

  group('realtimeStatusProvider', () {
    test('defaults to idle', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(realtimeStatusProvider), RealtimeStatus.idle);
    });

    test('can be updated', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(realtimeStatusProvider.notifier).state =
          RealtimeStatus.open;
      expect(container.read(realtimeStatusProvider), RealtimeStatus.open);
    });
  });

  group('RealtimeClient auth-fail detection', () {
    test('auth error frame triggers onBustTokenCache on reconnect', () async {
      var bustTokenCacheCalled = false;

      final client = RealtimeClient(
        url: 'ws://localhost:3000/ws',
        getTokens: () async => {'accessToken': 'test'},
        onStatusChange: (_) {},
        onFrame: (_) {},
        onBustTokenCache: () async {
          bustTokenCacheCalled = true;
        },
      );

      client.handleMessage('{"type":"error","msg":"auth failed"}');
      await client.handleOpen();

      expect(bustTokenCacheCalled, isTrue);
    });

    test('non-auth error frame does not trigger refresh', () async {
      var bustTokenCacheCalled = false;

      final client = RealtimeClient(
        url: 'ws://localhost:3000/ws',
        getTokens: () async => {'accessToken': 'test'},
        onStatusChange: (_) {},
        onFrame: (_) {},
        onBustTokenCache: () async {
          bustTokenCacheCalled = true;
        },
      );

      client.handleMessage('{"type":"error","msg":"something else"}');
      await client.handleOpen();

      expect(bustTokenCacheCalled, isFalse);
    });

    test('authenticated frame clears pending auth fail', () async {
      var bustTokenCacheCalled = false;

      final client = RealtimeClient(
        url: 'ws://localhost:3000/ws',
        getTokens: () async => {'accessToken': 'test'},
        onStatusChange: (_) {},
        onFrame: (_) {},
        onBustTokenCache: () async {
          bustTokenCacheCalled = true;
        },
      );

      client.handleMessage('{"type":"error","msg":"auth failed"}');
      client.handleMessage('{"type":"authenticated"}');

      // After authenticated frame, pending flag is cleared — reconnect
      // should use getTokens() directly, not refresh path
      await client.handleOpen();
      expect(bustTokenCacheCalled, isFalse);
    });

    test('handleMessage is no-op when destroyed', () async {
      var bustTokenCacheCalled = false;

      final client = RealtimeClient(
        url: 'ws://localhost:3000/ws',
        getTokens: () async => {'accessToken': 'test'},
        onStatusChange: (_) {},
        onFrame: (_) {},
        onBustTokenCache: () async {
          bustTokenCacheCalled = true;
        },
      );

      client.disconnect();
      client.handleMessage('{"type":"error","msg":"auth failed"}');
      await client.handleOpen();

      expect(bustTokenCacheCalled, isFalse);
    });

    test('handleMessage gracefully handles unparseable frames', () {
      final client = RealtimeClient(
        url: 'ws://localhost:3000/ws',
        getTokens: () async => null,
        onStatusChange: (_) {},
        onFrame: (_) {},
      );

      // Should not throw
      client.handleMessage('not json');
      client.handleMessage('123');
      client.handleMessage('');
    });

    test('onBustTokenCache error propagates from handleOpen', () async {
      final client = RealtimeClient(
        url: 'ws://localhost:3000/ws',
        getTokens: () async => null,
        onStatusChange: (_) {},
        onFrame: (_) {},
        onBustTokenCache: () async {
          throw Exception('refresh failed');
        },
      );

      client.handleMessage('{"type":"error","msg":"auth failed"}');

      await expectLater(
        client.handleOpen(),
        throwsA(isA<Exception>()),
      );
    });
  });
}
