import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_boilerplate/hooks/use_auth.dart';

void main() {
  group('authProvider', () {
    test('starts with null user', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final auth = container.read(authProvider);
      expect(auth.asData?.value, isNull);
    });
  });

  group('isAuthenticatedProvider', () {
    test('returns false when not authenticated', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(isAuthenticatedProvider), isFalse);
    });
  });

  group('currentUserProvider', () {
    test('returns null when not authenticated', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(currentUserProvider), isNull);
    });
  });

  group('userTierProvider', () {
    test('returns free when not authenticated', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(userTierProvider), 'free');
    });
  });
}
