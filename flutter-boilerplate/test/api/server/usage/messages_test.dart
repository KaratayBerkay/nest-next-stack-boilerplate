import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/usage/messages.dart';
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
      {"letters":4200,"bytes":8400,"limitBytes":1048576,"tier":"FREE",
       "multiplier":1,"from":"2026-08-01T00:00:00.000Z",
       "to":"2026-08-08T00:00:00.000Z"}
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
  group('MessageUsageServer', () {
    test('hits GET /api/usage/messages with no query params by default',
        () async {
      final adapter = _CapturingAdapter();
      final server = MessageUsageServer(Dio()..httpClientAdapter = adapter);

      final result = await server.call();

      final request = adapter.requests.single;
      expect(request.path, '/api/usage/messages');
      expect(request.queryParameters, isEmpty);
      expect(result.letters, 4200);
      expect(result.bytes, 8400);
      expect(result.limitBytes, 1048576);
      expect(result.multiplier, 1);
    });

    test('forwards from/to as query params when given', () async {
      final adapter = _CapturingAdapter();
      final server = MessageUsageServer(Dio()..httpClientAdapter = adapter);

      await server.call(from: '2026-07-01', to: '2026-07-31');

      final request = adapter.requests.single;
      expect(request.queryParameters['from'], '2026-07-01');
      expect(request.queryParameters['to'], '2026-07-31');
    });
  });
}
