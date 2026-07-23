import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final apiKeyCreateServerProvider = Provider((ref) => ApiKeyCreateServer(ref.read(dioProvider)));

class ApiKeyCreateServer {
  final Dio _dio;

  ApiKeyCreateServer(this._dio);

  Future<Map<String, dynamic>> call(String name) async {
    final response = await _dio.post<dynamic>(Urls.apiKeys, data: {'name': name});
    return response.data as Map<String, dynamic>;
  }
}
