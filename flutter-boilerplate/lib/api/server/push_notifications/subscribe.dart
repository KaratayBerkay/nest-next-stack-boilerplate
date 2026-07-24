import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final pushSubscribeServerProvider =
    Provider((ref) => PushSubscribeServer(ref.read(dioProvider)));

const _mutation = 'mutation SubscribePush(\$endpoint: String!, \$p256dh: String!, \$auth: String!, \$userAgent: String) { subscribePush(endpoint: \$endpoint, p256dh: \$p256dh, auth: \$auth, userAgent: \$userAgent) { id endpoint } }';

class PushSubscribeServer {
  final Dio _dio;

  PushSubscribeServer(this._dio);

  Future<void> call({
    required String endpoint,
    required String p256dh,
    required String auth,
    String? userAgent,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'endpoint': endpoint,
          'p256dh': p256dh,
          'auth': auth,
          if (userAgent != null) 'userAgent': userAgent,
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to subscribe push',
      );
    }
  }
}
