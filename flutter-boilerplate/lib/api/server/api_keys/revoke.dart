import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final apiKeyRevokeServerProvider =
    Provider((ref) => ApiKeyRevokeServer(ref.read(dioProvider)));

const _mutation = 'mutation RevokeApiKey(\$id: String!) { revokeApiKey(id: \$id) }';

class ApiKeyRevokeServer {
  final Dio _dio;

  ApiKeyRevokeServer(this._dio);

  Future<void> call(String keyId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'id': keyId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to revoke API key',
      );
    }
  }
}
