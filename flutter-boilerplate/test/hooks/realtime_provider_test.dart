import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  setUp(() {
    FlutterSecureStoragePlatform.instance =
        TestFlutterSecureStoragePlatform({});
  });

  group('RealtimeClient onFrame through realtimeProvider', () {
    test('room-counts frame updates roomCountsProvider', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(container.read(roomCountsProvider), isEmpty);

      client.handleMessage(
        '{"type":"room-counts","rooms":{"general":5,"tech":3}}',
      );

      expect(container.read(roomCountsProvider), {'general': 5, 'tech': 3});
    });

    test('room-counts with empty rooms clears counts', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);
      container.read(roomCountsProvider.notifier).state = {'general': 5};

      client.handleMessage(
        '{"type":"room-counts","rooms":{}}',
      );

      expect(container.read(roomCountsProvider), isEmpty);
    });

    test('user-joined frame updates roomMembersProvider', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(container.read(roomMembersProvider('general')), isEmpty);

      client.handleMessage(
        '{"type":"user-joined","room":"general","members":[{"id":"user-a","name":"Alice"}]}',
      );

      final members = container.read(roomMembersProvider('general'));
      expect(members.length, 1);
      expect(members[0]['id'], 'user-a');
    });

    test('user-left frame updates roomMembersProvider', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      client.handleMessage(
        '{"type":"user-left","room":"general","members":[{"id":"user-b","name":"Bob"}]}',
      );

      final members = container.read(roomMembersProvider('general'));
      expect(members.length, 1);
      expect(members[0]['id'], 'user-b');
    });

    test('renew Notifications Count frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"renew":"Notifications","type":"Count"}',
        ),
        returnsNormally,
      );
    });

    test('renew Notifications DmCount frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"renew":"Notifications","type":"DmCount"}',
        ),
        returnsNormally,
      );
    });

    test('renew Notifications Item frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"renew":"Notifications","type":"Item"}',
        ),
        returnsNormally,
      );
    });

    test('renew Notifications Read frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"renew":"Notifications","type":"Read"}',
        ),
        returnsNormally,
      );
    });

    test('renew Messages Conversation frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"renew":"Messages","type":"Conversation"}',
        ),
        returnsNormally,
      );
    });

    test('renew Feed New frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage('{"renew":"Feed","type":"New"}'),
        returnsNormally,
      );
    });

    test('renew Feed Post frame with id is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"renew":"Feed","type":"Post","id":"post-123"}',
        ),
        returnsNormally,
      );
    });

    test('renew Friends PendingList frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"renew":"Friends","type":"PendingList"}',
        ),
        returnsNormally,
      );
    });

    test('direct-message event frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"type":"direct-message","message":{"senderId":"user-a","recipientId":"user-b"}}',
        ),
        returnsNormally,
      );
    });

    test('message-read event frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"type":"message-read","peerId":"user-b"}',
        ),
        returnsNormally,
      );
    });

    test('room-message event frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage(
          '{"type":"room-message","room":"general"}',
        ),
        returnsNormally,
      );
    });

    test('unknown frame type is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage('{"type":"unknown-event"}'),
        returnsNormally,
      );
    });

    test('malformed frame is handled gracefully', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final client = container.read(realtimeProvider);

      expect(
        () => client.handleMessage('not json'),
        returnsNormally,
      );
    });

    test('realtimeConnectedProvider defaults to false', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(realtimeConnectedProvider), isFalse);
    });

    test('realtimeStatusProvider defaults to idle', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(realtimeStatusProvider), RealtimeStatus.idle);
    });
  });
}
