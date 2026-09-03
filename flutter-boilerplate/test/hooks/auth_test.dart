import 'package:dio/dio.dart';
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
    test('rejects (no call attempted) when no refresh token stored', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      final result = await notifier.refreshAccessToken();
      expect(result, RefreshResult.authRejected);
    });

    test(
      'rejects (no call attempted) when rbac/device/user tokens are missing',
      () async {
        final container = ProviderContainer();
        addTearDown(container.dispose);

        final notifier = container.read(authProvider.notifier);
        // A refresh token alone isn't enough to renew — the backend needs
        // the rbac/device/user tokens too, or the renewed session comes
        // back keyed on blanks that can never match a real request.
        await notifier.setRefreshToken('some-refresh-token');

        final result = await notifier.refreshAccessToken();
        expect(result, RefreshResult.authRejected);
      },
    );
  });

  // Regression (MOB-037): a failed HTTP call used to be indistinguishable
  // from an explicit token rejection inside refreshAccessToken's catch
  // block — both returned `false`, and the caller (AuthInterceptor's
  // _refreshOnce) logged the user out either way. This is the actual
  // classification refreshAccessToken's catch block now delegates to.
  group('classifyRefreshFailure', () {
    test('a 401 response classifies as authRejected', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/graphql'),
        response: Response(
          requestOptions: RequestOptions(path: '/graphql'),
          statusCode: 401,
        ),
      );
      expect(classifyRefreshFailure(error), RefreshResult.authRejected);
    });

    test('a 403 response classifies as authRejected', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/graphql'),
        response: Response(
          requestOptions: RequestOptions(path: '/graphql'),
          statusCode: 403,
        ),
      );
      expect(classifyRefreshFailure(error), RefreshResult.authRejected);
    });

    test('a DioException with no response classifies as networkError', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/graphql'),
        type: DioExceptionType.connectionError,
      );
      expect(classifyRefreshFailure(error), RefreshResult.networkError);
    });

    test('a 500 response classifies as networkError, not authRejected', () {
      // A server error is the server failing, not the server explicitly
      // saying "this token is invalid" — treating it as a rejection would
      // log the user out over the server's own problem, not theirs.
      final error = DioException(
        requestOptions: RequestOptions(path: '/graphql'),
        response: Response(
          requestOptions: RequestOptions(path: '/graphql'),
          statusCode: 500,
        ),
      );
      expect(classifyRefreshFailure(error), RefreshResult.networkError);
    });

    test('a non-Dio error classifies as networkError', () {
      expect(
        classifyRefreshFailure(Exception('boom')),
        RefreshResult.networkError,
      );
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
