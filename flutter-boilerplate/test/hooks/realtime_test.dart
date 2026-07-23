import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';

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

      container.read(realtimeStatusProvider.notifier).state = RealtimeStatus.open;
      expect(container.read(realtimeStatusProvider), RealtimeStatus.open);
    });
  });
}
