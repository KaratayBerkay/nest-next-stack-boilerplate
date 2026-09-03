import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/auth/refresh_token.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/lib/crypto/wire_crypto_storage.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';

/// Answers the two calls a refresh makes (`GET /csrf/token`, then the
/// GraphQL `refresh` mutation) and counts the mutation round-trips. The
/// mutation is deliberately slow so a second caller has time to pile up.
class _CountingRefreshAdapter implements HttpClientAdapter {
  int csrfCalls = 0;
  int refreshCalls = 0;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    if (options.path.endsWith('/csrf/token')) {
      csrfCalls++;
      return ResponseBody.fromString(
        '{"token":"csrf-1"}',
        200,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
          'set-cookie': ['csrf=abc; Path=/'],
        },
      );
    }
    final call = ++refreshCalls;
    await Future<void>.delayed(const Duration(milliseconds: 30));
    return ResponseBody.fromString(
      '{"data":{"refresh":{'
      '"accessToken":"access-$call","refreshToken":"refresh-$call",'
      '"rbacToken":"rbac-$call","deviceToken":"device-$call",'
      '"userToken":"user-$call"}}}',
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

const _user = AuthenticatedUser(
  id: '1',
  email: 'test@test.com',
  name: 'Test',
  tier: 'free',
);

void main() {
  setUp(() {
    FlutterSecureStoragePlatform.instance =
        TestFlutterSecureStoragePlatform({});
  });

  group('AuthNotifier.refreshAccessToken single-flight (MOB-046)', () {
    test(
        'concurrent callers share ONE refresh round-trip — the backend '
        'rotates the refresh token on every use, so a second overlapping '
        'refresh would present an already-consumed token and log the user '
        'out of a healthy session', () async {
      final adapter = _CountingRefreshAdapter();
      final notifier = AuthNotifier(
        refreshServerFactory: () =>
            RefreshTokenServer(Dio()..httpClientAdapter = adapter),
      );
      await notifier.setSession(
        'access-0',
        _user,
        rbacToken: 'rbac-0',
        deviceToken: 'device-0',
        userToken: 'user-0',
      );
      await notifier.setRefreshToken('refresh-0');

      // The realtime client's onBustTokenCache and AuthInterceptor's 401
      // path calling in at the same moment.
      final results = await Future.wait([
        notifier.refreshAccessToken(),
        notifier.refreshAccessToken(),
        notifier.refreshAccessToken(),
      ]);

      expect(results, everyElement(RefreshResult.success));
      expect(adapter.refreshCalls, 1);
      expect(adapter.csrfCalls, 1);
      expect(await notifier.getRefreshToken(), 'refresh-1');
      final tokens = await notifier.getAuthTokens();
      expect(tokens!['accessToken'], 'access-1');
      expect(tokens['deviceToken'], 'device-1');
    });

    test(
        'a refresh started after the previous one finished is a new round-trip',
        () async {
      final adapter = _CountingRefreshAdapter();
      final notifier = AuthNotifier(
        refreshServerFactory: () =>
            RefreshTokenServer(Dio()..httpClientAdapter = adapter),
      );
      await notifier.setSession(
        'access-0',
        _user,
        rbacToken: 'rbac-0',
        deviceToken: 'device-0',
        userToken: 'user-0',
      );
      await notifier.setRefreshToken('refresh-0');

      await notifier.refreshAccessToken();
      await notifier.refreshAccessToken();

      expect(adapter.refreshCalls, 2);
      expect(await notifier.getRefreshToken(), 'refresh-2');
    });
  });

  group('AuthNotifier.logout wire-crypto keys (MOB-045)', () {
    test('drops the keypair scoped to the device token being logged out',
        () async {
      final notifier = AuthNotifier();
      await notifier.setSession(
        'access',
        _user,
        rbacToken: 'rbac',
        deviceToken: 'device-abc',
        userToken: 'user',
      );
      const storage = FlutterSecureStorage();
      await storage.write(
        key: wireCryptoStorageKey('device-abc'),
        value: '{"priv":"00","pub":"11","sendSeq":3,"recvSeq":4}',
      );
      // A keypair for some *other* device token is not this logout's to touch.
      await storage.write(
        key: wireCryptoStorageKey('device-other'),
        value: '{"priv":"22","pub":"33","sendSeq":0,"recvSeq":0}',
      );

      await notifier.logout();

      expect(
        await storage.read(key: wireCryptoStorageKey('device-abc')),
        isNull,
      );
      expect(
        await storage.read(key: wireCryptoStorageKey('device-other')),
        isNotNull,
      );
      expect(await notifier.getAuthTokens(), isNull);
    });

    test('logout with no stored device token still clears the session',
        () async {
      final notifier = AuthNotifier();
      await notifier.setRefreshToken('refresh');

      await notifier.logout();

      expect(await notifier.getRefreshToken(), isNull);
    });
  });
}
