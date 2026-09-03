import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter(this.body, {this.statusCode = 200});

  final String body;
  final int statusCode;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    return ResponseBody.fromString(
      body,
      statusCode,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

class _FakeAuthNotifier extends AuthNotifier {
  _FakeAuthNotifier(this._refreshResult);

  final RefreshResult _refreshResult;
  bool loggedOut = false;

  @override
  Future<RefreshResult> refreshAccessToken() async => _refreshResult;

  @override
  Future<void> logout() async {
    loggedOut = true;
    await super.logout();
  }

  @override
  Future<Map<String, String>?> getAuthTokens() async => {
        'accessToken': 'fake-access',
        'rbacToken': 'fake-rbac',
        'deviceToken': 'fake-device',
        'userToken': 'fake-user',
      };
}

void main() {
  setUp(() {
    FlutterSecureStoragePlatform.instance =
        TestFlutterSecureStoragePlatform({});
  });

  group('AuthInterceptor GraphQL auth-failure detection', () {
    test(
      'a 200 GraphQL response with extensions.statusCode 401 is surfaced as a real error',
      () async {
        final container = ProviderContainer();
        addTearDown(container.dispose);

        final dio = container.read(dioProvider);
        dio.httpClientAdapter = _FakeAdapter(
          jsonEncode({
            'errors': [
              {
                'message': 'Invalid or expired access token',
                'extensions': {
                  'statusCode': 401,
                  'exc': 'EX_AUTH_INVALID_CREDENTIALS',
                },
              },
            ],
          }),
        );

        // No refresh token is stored, so refreshAccessToken() fails fast
        // with no network call — the point under test is that this still
        // has to come back as a thrown error rather than a silent "success"
        // response the caller's own `body['errors']` check has to notice.
        await expectLater(
          dio.post<dynamic>('/graphql', data: {'query': 'mutation {}'}),
          throwsA(isA<DioException>()),
        );
      },
    );

    test(
      'a 200 GraphQL response with a non-401 error status passes through unchanged',
      () async {
        final container = ProviderContainer();
        addTearDown(container.dispose);

        final dio = container.read(dioProvider);
        dio.httpClientAdapter = _FakeAdapter(
          jsonEncode({
            'errors': [
              {
                'message': 'You can only send messages to friends',
                'extensions': {'statusCode': 403, 'exc': 'EX_FORBIDDEN'},
              },
            ],
          }),
        );

        final response = await dio.post<dynamic>(
          '/graphql',
          data: {'query': 'mutation {}'},
        );

        expect(response.statusCode, 200);
        expect((response.data as Map<String, dynamic>)['errors'], isNotNull);
      },
    );

    test('a normal REST 200 response is left untouched', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final dio = container.read(dioProvider);
      dio.httpClientAdapter = _FakeAdapter(jsonEncode({'ok': true}));

      final response = await dio.get<dynamic>('/api/messages/unread-count');

      expect(response.statusCode, 200);
      expect((response.data as Map<String, dynamic>)['ok'], isTrue);
    });
  });

  // Regression (MOB-037): AuthInterceptor used to log the user out on ANY
  // failed refresh, network blips included — refreshAccessToken's old bare
  // `catch (_) { return false; }` made a transient connectivity failure
  // indistinguishable from the server explicitly rejecting the token.
  group('AuthInterceptor refresh-failure handling on a real 401', () {
    test('logs out when the refresh is explicitly rejected', () async {
      final fakeNotifier = _FakeAuthNotifier(RefreshResult.authRejected);
      final container = ProviderContainer(
        overrides: [authProvider.overrideWith((ref) => fakeNotifier)],
      );
      addTearDown(container.dispose);

      final dio = container.read(dioProvider);
      dio.httpClientAdapter = _FakeAdapter('{}', statusCode: 401);

      await expectLater(
        dio.get<dynamic>('/api/messages/unread-count'),
        throwsA(isA<DioException>()),
      );
      expect(fakeNotifier.loggedOut, isTrue);
    });

    test(
      'does NOT log out when the refresh merely fails to reach the server',
      () async {
        final fakeNotifier = _FakeAuthNotifier(RefreshResult.networkError);
        final container = ProviderContainer(
          overrides: [authProvider.overrideWith((ref) => fakeNotifier)],
        );
        addTearDown(container.dispose);

        final dio = container.read(dioProvider);
        dio.httpClientAdapter = _FakeAdapter('{}', statusCode: 401);

        // The original request still fails either way — refreshAccessToken
        // didn't produce a usable new token regardless of *why* — but the
        // session itself must survive a merely-transient refresh failure.
        await expectLater(
          dio.get<dynamic>('/api/messages/unread-count'),
          throwsA(isA<DioException>()),
        );
        expect(fakeNotifier.loggedOut, isFalse);
      },
    );
  });
}
