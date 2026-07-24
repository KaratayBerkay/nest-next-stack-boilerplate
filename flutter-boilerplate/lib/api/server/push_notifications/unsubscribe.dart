import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final pushUnsubscribeServerProvider =
    Provider((ref) => PushUnsubscribeServer(ref.read(dioProvider)));

const _mutation = 'mutation UnsubscribePush(\$endpoint: String!) { unsubscribePush(endpoint: \$endpoint) }';

class PushUnsubscribeServer {
  final Dio _dio;

  PushUnsubscribeServer(this._dio);

  Future<void> call(String endpoint) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'endpoint': endpoint},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to unsubscribe push',
      );
    }
  }
}
