import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final revokeSessionServerProvider =
    Provider((ref) => RevokeSessionServer(ref.read(dioProvider)));

const _mutation =
    'mutation RevokeSession(\$sessionId: ID!) { revokeSession(sessionId: \$sessionId) }';

class RevokeSessionServer {
  final Dio _dio;

  RevokeSessionServer(this._dio);

  Future<void> call(String sessionId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'sessionId': sessionId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to revoke session',
      );
    }
  }
}
