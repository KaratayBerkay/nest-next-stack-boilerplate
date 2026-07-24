import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final adminSetTierServerProvider =
    Provider((ref) => AdminSetTierServer(ref.read(dioProvider)));

const _mutation = 'mutation SetUserTier(\$userId: String!, \$tier: SubscriptionTier!) { setUserTier(userId: \$userId, tier: \$tier) }';

class AdminSetTierServer {
  final Dio _dio;

  AdminSetTierServer(this._dio);

  Future<void> call(String userId, String tier) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'userId': userId,
          'tier': tier,
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to set user tier',
      );
    }
  }
}
