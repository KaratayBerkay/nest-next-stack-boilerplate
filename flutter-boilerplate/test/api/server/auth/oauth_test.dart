import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/auth/oauth.dart';
import 'package:flutter_test/flutter_test.dart';

class _CapturingAdapter implements HttpClientAdapter {
  final List<dynamic> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options.data);
    return ResponseBody.fromString(
      '''
      {"data":{"loginWithOAuth":{
        "accessToken":"access-token-value",
        "refreshToken":"refresh-token-value",
        "rbacToken":"rbac-token-value",
        "deviceToken":"device-token-value",
        "userToken":"user-token-value",
        "user":{
          "id":"u1",
          "email":"a@example.com",
          "name":"A User",
          "tier":"FREE",
          "role":"USER",
          "avatarUrl":null
        }
      }}}
      ''',
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
  group('OAuthLoginServer', () {
    test(
      'sends only state under OAuthLoginInput, never a client-supplied profile',
      () async {
        final adapter = _CapturingAdapter();
        final server = OAuthLoginServer(Dio()..httpClientAdapter = adapter);

        final result = await server.call('state-value-123');

        final data = adapter.requests.single as Map<String, dynamic>;
        expect(data['variables'], {
          'input': {'state': 'state-value-123'},
        });
        final query = data['query'] as String;
        expect(query, contains(r'$input: OAuthLoginInput!'));
        expect(query, contains(r'loginWithOAuth(input: $input)'));
        // The backend's account-takeover fix deleted OAuthProfileInput
        // entirely — regression guard against ever again posting a
        // client-supplied profile object instead of a server-redeemed state.
        expect(query, isNot(contains('OAuthProfileInput')));
        expect(query, isNot(contains('profile:')));

        expect(result.accessToken, 'access-token-value');
        expect(result.refreshToken, 'refresh-token-value');
        expect(result.rbacToken, 'rbac-token-value');
        expect(result.deviceToken, 'device-token-value');
        expect(result.userToken, 'user-token-value');
        expect(result.user.id, 'u1');
      },
    );

    test('throws with the backend message when the mutation errors', () async {
      final adapter = _ErrorAdapter();
      final server = OAuthLoginServer(Dio()..httpClientAdapter = adapter);

      expect(
        () => server.call('bad-state'),
        throwsA(
          isA<DioException>().having(
            (e) => e.message,
            'message',
            contains('Unknown or expired state'),
          ),
        ),
      );
    });
  });
}

class _ErrorAdapter implements HttpClientAdapter {
  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    return ResponseBody.fromString(
      '{"errors":[{"message":"Unknown or expired state"}]}',
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
