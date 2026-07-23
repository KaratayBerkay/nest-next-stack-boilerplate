import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

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
      prefix: json['prefix'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastUsedAt: json['lastUsedAt'] != null
          ? DateTime.parse(json['lastUsedAt'] as String)
          : null,
    );
  }
}

final apiKeyListServerProvider = Provider((ref) => ApiKeyListServer(ref.read(dioProvider)));

class ApiKeyListServer {
  final Dio _dio;

  ApiKeyListServer(this._dio);

  Future<List<ApiKey>> call() async {
    final response = await _dio.get<dynamic>(Urls.apiKeys);
    final list = response.data as List<dynamic>;
    return list.map((e) => ApiKey.fromJson(e as Map<String, dynamic>)).toList();
  }
}
