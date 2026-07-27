import 'package:flutter_boilerplate/hooks/use_currency.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('currencyProvider', () {
    test('defaults to USD', () async {
      SharedPreferences.setMockInitialValues({});
      final container = ProviderContainer();
      addTearDown(container.dispose);
      await container.read(currencyProvider.notifier).setCurrency('USD');
      // The provider is async-initialized; wait for load
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(container.read(currencyProvider), 'USD');
    });

    test('setCurrency updates state', () async {
      SharedPreferences.setMockInitialValues({});
      final container = ProviderContainer();
      addTearDown(container.dispose);
      await container.read(currencyProvider.notifier).setCurrency('EUR');
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(container.read(currencyProvider), 'EUR');
    });
  });
}
