import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/hooks/use_theme.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('themeModeProvider', () {
    test('defaults to light', () async {
      SharedPreferences.setMockInitialValues({});
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(themeModeProvider), AppThemeMode.light);
    });

    test('can switch to dark', () async {
      SharedPreferences.setMockInitialValues({});
      final container = ProviderContainer();
      addTearDown(container.dispose);

      await container
          .read(themeModeProvider.notifier)
          .setMode(AppThemeMode.dark);
      expect(container.read(themeModeProvider), AppThemeMode.dark);
    });
  });
}
