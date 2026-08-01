import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final stripeServerProvider =
    Provider((ref) => StripeServer(ref.read(dioProvider)));

const _setupIntentMutation =
    'mutation CreateBillingSetupIntent { createBillingSetupIntent { clientSecret } }';

const _subscribeMutation = '''
  mutation SubscribeToPlan(\$tier: SubscriptionTier!, \$paymentMethodId: String) {
    subscribeToPlan(tier: \$tier, paymentMethodId: \$paymentMethodId) {
      success
      reason
      periodEnd
      pendingTier
      pendingTierEffectiveAt
    }
  }
''';

class StripeServer {
  final Dio _dio;

  StripeServer(this._dio);

  Future<Map<String, dynamic>> createSetupIntent() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _setupIntentMutation},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to create setup intent',
      );
    }
    return (body['data'] as Map<String, dynamic>)['createBillingSetupIntent']
        as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> subscribe(String priceId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _subscribeMutation,
        'variables': {'tier': priceId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to subscribe',
      );
    }
    return (body['data'] as Map<String, dynamic>)['subscribeToPlan']
        as Map<String, dynamic>;
  }
}
