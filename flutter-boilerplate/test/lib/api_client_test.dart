import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter(this.body);

  final String body;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    return ResponseBody.fromString(
      body,
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
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
}
