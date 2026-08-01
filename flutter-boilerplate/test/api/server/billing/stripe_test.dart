import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/billing/stripe.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
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
      '{"data":{"subscribeToPlan":{"success":true,"reason":null,"periodEnd":null}}}',
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
  group('Tier.graphQlEnum', () {
    test('maps every plan slug to the backend SubscriptionTier enum value', () {
      expect(Tier.graphQlEnum('basic'), 'BASIC');
      expect(Tier.graphQlEnum('medium'), 'MEDIUM');
      expect(Tier.graphQlEnum('premium'), 'PREMIUM');
      expect(Tier.graphQlEnum('free'), 'FREE');
    });

    test('returns empty string for unknown/null plans', () {
      expect(Tier.graphQlEnum(null), '');
      expect(Tier.graphQlEnum('price_basic'), 'PRICE_BASIC');
    });
  });

  group('StripeServer.subscribe variables', () {
    test('sends the real tier enum, never a Stripe price ID', () async {
      final adapter = _CapturingAdapter();
      final server = StripeServer(Dio()..httpClientAdapter = adapter);

      for (final plan in ['basic', 'medium', 'premium']) {
        await server.subscribe(Tier.graphQlEnum(plan));
      }

      final tiers = adapter.requests
          .map(
            (data) => ((data as Map<String, dynamic>)['variables']
                as Map<String, dynamic>)['tier'],
          )
          .toList();
      expect(tiers, ['BASIC', 'MEDIUM', 'PREMIUM']);
    });
  });
}
