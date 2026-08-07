import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/usage/storage.dart';
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
      {"bytes":1048576,"fileCount":3,"limitBytes":10485760,"tier":"BASIC","multiplier":2}
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
  group('StorageUsageServer', () {
    test('hits GET /api/usage/storage and parses the result', () async {
      final adapter = _CapturingAdapter();
      final server = StorageUsageServer(Dio()..httpClientAdapter = adapter);

      final result = await server.call();

      expect(adapter.requests.single.path, '/api/usage/storage');
      expect(adapter.requests.single.method, 'GET');
      expect(result.bytes, 1048576);
      expect(result.fileCount, 3);
      expect(result.limitBytes, 10485760);
      expect(result.tier, 'BASIC');
      expect(result.multiplier, 2);
    });
  });
}
