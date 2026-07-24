import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ApiKey {
  final String id;
  final String name;
  final String prefix;
  final DateTime createdAt;
  final DateTime? lastUsedAt;

  const ApiKey({
    required this.id,
    required this.name,
    required this.prefix,
    required this.createdAt,
    this.lastUsedAt,
  });

  factory ApiKey.fromJson(Map<String, dynamic> json) {
    return ApiKey(
      id: json['id'] as String,
      name: json['name'] as String,
      prefix: json['keyPrefix'] as String? ?? json['prefix'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastUsedAt: json['lastUsedAt'] != null
          ? DateTime.parse(json['lastUsedAt'] as String)
          : null,
    );
  }
}

final apiKeyListServerProvider =
    Provider((ref) => ApiKeyListServer(ref.read(dioProvider)));

const _query = '''
  query MyApiKeys {
    myApiKeys {
      id
      name
      keyPrefix
      createdAt
      lastUsedAt
      expiresAt
      enabled
      role
      tier
    }
  }
''';

class ApiKeyListServer {
  final Dio _dio;

  ApiKeyListServer(this._dio);

  Future<List<ApiKey>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch API keys',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['myApiKeys'] as List;
    return list.map((e) => ApiKey.fromJson(e as Map<String, dynamic>)).toList();
  }
}
