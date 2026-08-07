import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/auth/refresh_token.dart';
import 'package:flutter_test/flutter_test.dart';

class _RecordingAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    if (options.method == 'GET' && options.path == '/csrf/token') {
      return ResponseBody.fromString(
        jsonEncode({'token': 'csrf-token-value'}),
        200,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
          'set-cookie': ['csrf-token=abc123; Path=/; HttpOnly'],
        },
      );
    }
    return ResponseBody.fromString(
      jsonEncode({
        'data': {
          'refresh': {
            'accessToken': 'new-access-token',
            'refreshToken': 'new-refresh-token',
            'rbacToken': 'new-rbac-token',
            'deviceToken': 'new-device-token',
            'userToken': 'new-user-token',
          },
        },
      }),
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
  test(
    'call() sends rbac/device/user tokens alongside the refresh token',
    () async {
      final adapter = _RecordingAdapter();
      final dio = Dio(BaseOptions(baseUrl: 'http://test'));
      dio.httpClientAdapter = adapter;
      final server = RefreshTokenServer(dio);

      final result = await server.call(
        'refresh-token-value',
        rbacToken: 'rbac-token-value',
        deviceToken: 'device-token-value',
        userToken: 'user-token-value',
      );

      expect(result.accessToken, 'new-access-token');
      expect(result.refreshToken, 'new-refresh-token');
      // The backend rotates rbac/device/user tokens on every refresh and
      // revokes the compound Redis key they were keyed on — the caller
      // must receive (and, at the use_auth.dart call site, persist) the
      // new trio or the very next authenticated request 401s again even
      // though this refresh itself succeeded.
      expect(result.rbacToken, 'new-rbac-token');
      expect(result.deviceToken, 'new-device-token');
      expect(result.userToken, 'new-user-token');

      final refreshRequest = adapter.requests.firstWhere(
        (r) => r.path == '/graphql',
      );
      expect(refreshRequest.headers['x-refresh-token'], 'refresh-token-value');
      expect(refreshRequest.headers['x-rbac-token'], 'rbac-token-value');
      expect(refreshRequest.headers['x-device-token'], 'device-token-value');
      expect(refreshRequest.headers['x-user-token'], 'user-token-value');
      expect(refreshRequest.headers['x-csrf-token'], 'csrf-token-value');

      final query =
          (refreshRequest.data as Map<String, dynamic>)['query'] as String;
      expect(query, contains('rbacToken'));
      expect(query, contains('deviceToken'));
      expect(query, contains('userToken'));
    },
  );
}
