import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/auth/login.dart';
import 'package:flutter_boilerplate/types/auth/auth_request_types.dart';
import 'package:flutter_test/flutter_test.dart';

class _CapturingAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    return ResponseBody.fromString(
      '''
      {"data":{"login":{
        "accessToken":"at","refreshToken":"rt","rbacToken":"rbac",
        "deviceToken":"dt","userToken":"ut",
        "user":{"id":"u1","email":"a@example.com","name":"Alice"}
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
  group('LoginServer', () {
    test('includes timezone in the input when provided', () async {
      final adapter = _CapturingAdapter();
      final server = LoginServer(Dio()..httpClientAdapter = adapter);

      await server.call(
        const LoginRequest(
          email: 'a@example.com',
          password: 'pw',
          timezone: 'Europe/Istanbul',
        ),
      );

      final variables = (adapter.requests.single.data
          as Map<String, dynamic>)['variables'] as Map<String, dynamic>;
      final input = variables['input'] as Map<String, dynamic>;
      expect(input['timezone'], 'Europe/Istanbul');
    });

    test(
        'omits timezone entirely when not provided, matching the '
        'optional backend field', () async {
      final adapter = _CapturingAdapter();
      final server = LoginServer(Dio()..httpClientAdapter = adapter);

      await server.call(
        const LoginRequest(email: 'a@example.com', password: 'pw'),
      );

      final variables = (adapter.requests.single.data
          as Map<String, dynamic>)['variables'] as Map<String, dynamic>;
      final input = variables['input'] as Map<String, dynamic>;
      expect(input.containsKey('timezone'), isFalse);
    });
  });
}
