import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SubscriptionInfo {
  final String plan;
  final String status;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;
  final int? priceCents;
  final String? currency;

  const SubscriptionInfo({
    required this.plan,
    required this.status,
    this.currentPeriodEnd,
    this.cancelAtPeriodEnd = false,
    this.priceCents,
    this.currency,
  });

  factory SubscriptionInfo.fromJson(Map<String, dynamic> json) {
    return SubscriptionInfo(
      plan: ((json['tier'] as String?) ?? (json['plan'] as String?))
              ?.toLowerCase() ??
          'free',
      status: json['cancelAtPeriodEnd'] == true ? 'canceling' : 'active',
      currentPeriodEnd: json['periodEnd'] != null
          ? DateTime.tryParse(json['periodEnd'] as String)
          : null,
      cancelAtPeriodEnd: json['cancelAtPeriodEnd'] as bool? ?? false,
      priceCents: json['priceCents'] as int?,
      currency: json['currency'] as String?,
    );
  }
}

final subscriptionServerProvider =
    Provider((ref) => SubscriptionServer(ref.read(dioProvider)));

const _query = '''
  query MySubscription {
    mySubscription {
      tier
      priceCents
      currency
      periodStart
      periodEnd
      cancelAtPeriodEnd
    }
  }
''';

class SubscriptionServer {
  final Dio _dio;

  SubscriptionServer(this._dio);

  Future<SubscriptionInfo> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch subscription',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['mySubscription']
        as Map<String, dynamic>;
    return SubscriptionInfo.fromJson(result);
  }
}
