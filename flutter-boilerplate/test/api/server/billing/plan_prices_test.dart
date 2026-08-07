import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/billing/plan_prices.dart';
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
      {"data":{"planPrices":[
        {"tier":"FREE","priceCents":0,"currency":"USD"},
        {"tier":"BASIC","priceCents":999,"currency":"USD"}
      ]}}
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
  group('PlanPricesServer', () {
    test('sends currency as a GraphQL variable when given', () async {
      final adapter = _CapturingAdapter();
      final server = PlanPricesServer(Dio()..httpClientAdapter = adapter);

      final result = await server.call(currency: 'EUR');

      final request = adapter.requests.single;
      expect(request.path, '/graphql');
      final variables = (request.data as Map<String, dynamic>)['variables']
          as Map<String, dynamic>;
      expect(variables['currency'], 'EUR');
      expect(result, hasLength(2));
      expect(result[0].tier, 'FREE');
      expect(result[1].priceCents, 999);
    });

    test('omits currency when not given', () async {
      final adapter = _CapturingAdapter();
      final server = PlanPricesServer(Dio()..httpClientAdapter = adapter);

      await server.call();

      final variables = (adapter.requests.single.data
          as Map<String, dynamic>)['variables'] as Map<String, dynamic>;
      expect(variables.containsKey('currency'), isFalse);
    });
  });
}
