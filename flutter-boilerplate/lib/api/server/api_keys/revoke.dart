import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final apiKeyRevokeServerProvider = Provider((ref) => ApiKeyRevokeServer(ref.read(dioProvider)));

class ApiKeyRevokeServer {
  final Dio _dio;

  ApiKeyRevokeServer(this._dio);

  Future<void> call(String keyId) async {
    await _dio.delete<dynamic>('${Urls.apiKeys}/$keyId');
  }
}
