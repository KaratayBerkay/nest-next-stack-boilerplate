import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final billingCancelServerProvider =
    Provider((ref) => BillingCancelServer(ref.read(dioProvider)));

const _mutation = 'mutation CancelSubscription { cancelSubscription }';

class BillingCancelServer {
  final Dio _dio;

  BillingCancelServer(this._dio);

  Future<void> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _mutation},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to cancel subscription',
      );
    }
  }
}
