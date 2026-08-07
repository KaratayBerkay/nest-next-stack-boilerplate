import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PlanPrice {
  final String tier;
  final int priceCents;
  final String currency;

  const PlanPrice({
    required this.tier,
    required this.priceCents,
    required this.currency,
  });

  factory PlanPrice.fromJson(Map<String, dynamic> json) {
    return PlanPrice(
      tier: json['tier'] as String,
      priceCents: json['priceCents'] as int,
      currency: json['currency'] as String,
    );
  }
}

final planPricesServerProvider = Provider(
  (ref) => PlanPricesServer(ref.read(dioProvider)),
);

const _query = '''
  query PlanPrices(\$currency: String) {
    planPrices(currency: \$currency) {
      tier
      priceCents
      currency
    }
  }
''';

class PlanPricesServer {
  final Dio _dio;

  PlanPricesServer(this._dio);

  Future<List<PlanPrice>> call({String? currency}) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {if (currency != null) 'currency': currency},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: 'Failed to fetch plan prices',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['planPrices'] as List;
    return list
        .map((e) => PlanPrice.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
