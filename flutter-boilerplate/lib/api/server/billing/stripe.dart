import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final stripeServerProvider =
    Provider((ref) => StripeServer(ref.read(dioProvider)));

const _setupIntentMutation =
    'mutation CreateBillingSetupIntent { createBillingSetupIntent { clientSecret } }';

const _subscribeMutation = '''
  mutation SubscribeToPlan(
    \$tier: SubscriptionTier!
    \$paymentMethodId: String
    \$idempotencyKey: String
    \$currency: String
  ) {
    subscribeToPlan(
      tier: \$tier
      paymentMethodId: \$paymentMethodId
      idempotencyKey: \$idempotencyKey
      currency: \$currency
    ) {
      success
      reason
      periodEnd
      pendingTier
      pendingTierEffectiveAt
      clientSecret
      stripeSubscriptionId
    }
  }
''';

// BE-019: second half of a first subscription whose card needed 3DS.
const _finalizeMutation = '''
  mutation FinalizeSubscription(\$stripeSubscriptionId: String!) {
    finalizeSubscription(stripeSubscriptionId: \$stripeSubscriptionId) {
      success
      reason
      periodEnd
      clientSecret
      stripeSubscriptionId
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

  Future<Map<String, dynamic>> subscribe(
    String priceId, {
    String? paymentMethodId,
    String? idempotencyKey,
    String? currency,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _subscribeMutation,
        'variables': {
          'tier': priceId,
          'paymentMethodId': paymentMethodId,
          'idempotencyKey': idempotencyKey,
          'currency': currency,
        },
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

  Future<Map<String, dynamic>> finalizeSubscription(
    String stripeSubscriptionId,
  ) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _finalizeMutation,
        'variables': {'stripeSubscriptionId': stripeSubscriptionId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to finalize subscription',
      );
    }
    return (body['data'] as Map<String, dynamic>)['finalizeSubscription']
        as Map<String, dynamic>;
  }
}
