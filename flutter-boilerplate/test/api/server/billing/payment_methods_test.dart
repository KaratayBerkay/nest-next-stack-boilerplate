import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/billing/remove_payment_method.dart';
import 'package:flutter_boilerplate/api/server/billing/set_default_payment_method.dart';
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
      '{"data":{}}',
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
  group('RemovePaymentMethodServer', () {
    test('sends the paymentMethodId argument name, not id', () async {
      final adapter = _CapturingAdapter();
      final server =
          RemovePaymentMethodServer(Dio()..httpClientAdapter = adapter);

      await server.call('pm_123');

      final data = adapter.requests.single as Map<String, dynamic>;
      expect(data['variables'], {'paymentMethodId': 'pm_123'});
      expect(
        (data['query'] as String),
        contains('removePaymentMethod(paymentMethodId:'),
      );
      expect(
        (data['query'] as String),
        isNot(contains('removePaymentMethod(id:')),
      );
    });
  });

  group('SetDefaultPaymentMethodServer', () {
    test('sends the paymentMethodId argument name, not id', () async {
      final adapter = _CapturingAdapter();
      final server =
          SetDefaultPaymentMethodServer(Dio()..httpClientAdapter = adapter);

      await server.call('pm_456');

      final data = adapter.requests.single as Map<String, dynamic>;
      expect(data['variables'], {'paymentMethodId': 'pm_456'});
      expect(
        (data['query'] as String),
        contains('setDefaultPaymentMethod(paymentMethodId:'),
      );
      expect(
        (data['query'] as String),
        isNot(contains('setDefaultPaymentMethod(id:')),
      );
    });
  });
}
