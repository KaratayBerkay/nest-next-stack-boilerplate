import 'package:flutter_boilerplate/hooks/use_locale.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('localeProvider', () {
    test('defaults to en', () async {
      SharedPreferences.setMockInitialValues({});
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(localeProvider), 'en');
    });

    test('can be updated', () async {
      SharedPreferences.setMockInitialValues({});
      final container = ProviderContainer();
      addTearDown(container.dispose);

      await container.read(localeProvider.notifier).setLocale('tr');
      expect(container.read(localeProvider), 'tr');
    });
  });
}
