import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  setUp(() {
    FlutterSecureStoragePlatform.instance =
        TestFlutterSecureStoragePlatform({});
  });

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

  group('AuthNotifier.setRefreshToken / getRefreshToken', () {
    test('setRefreshToken stores and getRefreshToken retrieves', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      await notifier.setRefreshToken('test-refresh-token');

      final result = await notifier.getRefreshToken();
      expect(result, 'test-refresh-token');
    });

    test('getRefreshToken returns null when nothing stored', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      final result = await notifier.getRefreshToken();
      expect(result, isNull);
    });

    test('setRefreshToken overwrites previous value', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      await notifier.setRefreshToken('first-token');
      await notifier.setRefreshToken('second-token');

      final result = await notifier.getRefreshToken();
      expect(result, 'second-token');
    });
  });

  group('AuthNotifier.updateAccessToken', () {
    test('updateAccessToken stores the new access token', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      const user = AuthenticatedUser(
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        tier: 'free',
      );
      await notifier.setSession(
        'original-token',
        user,
        rbacToken: 'rbac',
        deviceToken: 'device',
        userToken: 'user',
      );

      await notifier.updateAccessToken('updated-token');

      final tokens = await notifier.getAuthTokens();
      expect(tokens, isNotNull);
      expect(tokens!['accessToken'], 'updated-token');
    });
  });

  group('AuthNotifier.refreshAccessToken', () {
    test('returns false when no refresh token stored', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      final result = await notifier.refreshAccessToken();
      expect(result, isFalse);
    });

    test('returns false when refresh fails', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      await notifier.setRefreshToken('invalid-token');

      final result = await notifier.refreshAccessToken();
      expect(result, isFalse);
    });
  });

  group('AuthNotifier.setSession / logout / getAuthTokens', () {
    test('setSession stores all tokens and user', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      const user = AuthenticatedUser(
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        tier: 'premium',
      );
      await notifier.setSession(
        'access',
        user,
        rbacToken: 'rbac',
        deviceToken: 'device',
        userToken: 'user',
      );

      final tokens = await notifier.getAuthTokens();
      expect(tokens, isNotNull);
      expect(tokens!['accessToken'], 'access');
      expect(tokens['rbacToken'], 'rbac');
      expect(tokens['deviceToken'], 'device');
      expect(tokens['userToken'], 'user');

      final current = container.read(authProvider);
      expect(current.asData?.value?.id, '1');
      expect(current.asData?.value?.tier, 'premium');
    });

    test('logout clears tokens and user', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      const user = AuthenticatedUser(
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        tier: 'free',
      );
      await notifier.setSession(
        'access',
        user,
        rbacToken: 'rbac',
        deviceToken: 'device',
        userToken: 'user',
      );
      await notifier.setRefreshToken('refresh');

      await notifier.logout();

      final tokens = await notifier.getAuthTokens();
      expect(tokens, isNull);

      final refresh = await notifier.getRefreshToken();
      expect(refresh, isNull);

      expect(container.read(isAuthenticatedProvider), isFalse);
    });
  });
}
