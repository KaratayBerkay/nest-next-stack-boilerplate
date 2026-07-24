import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final apiKeyCreateServerProvider =
    Provider((ref) => ApiKeyCreateServer(ref.read(dioProvider)));

const _mutation = 'mutation CreateApiKey(\$name: String!, \$expiresInDays: Int) { createApiKey(name: \$name, expiresInDays: \$expiresInDays) { fullKey key { id name keyPrefix createdAt lastUsedAt expiresAt enabled } } }';

class ApiKeyCreateServer {
  final Dio _dio;

  ApiKeyCreateServer(this._dio);

  Future<Map<String, dynamic>> call(String name) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'name': name},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to create API key',
      );
    }
    return (body['data'] as Map<String, dynamic>)['createApiKey'] as Map<String, dynamic>;
  }
}
