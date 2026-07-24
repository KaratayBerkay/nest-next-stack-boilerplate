import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final securityNonceServerProvider =
    Provider((ref) => SecurityNonceServer(ref.read(dioProvider)));

class SecurityNonceServer {
  final Dio _dio;

  SecurityNonceServer(this._dio);

  Future<String> call() async {
    final response = await _dio.get<dynamic>('/api/security/nonce');
    return response.data['nonce'] as String;
  }
}
