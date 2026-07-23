import 'package:flutter_boilerplate/hooks/use_locale.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('localeProvider', () {
    test('defaults to en', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(localeProvider), 'en');
    });

    test('can be updated', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(localeProvider.notifier).state = 'tr';
      expect(container.read(localeProvider), 'tr');
    });
  });
}
