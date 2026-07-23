import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../lib/api_client.dart';

final observabilityServerProvider = Provider((ref) => ObservabilityServer(ref.read(dioProvider)));

class ObservabilityServer {
  final Dio _dio;

  ObservabilityServer(this._dio);

  Future<Map<String, dynamic>> report(Map<String, dynamic> metrics) async {
    final response = await _dio.post<dynamic>('/api/observability', data: metrics);
    return response.data as Map<String, dynamic>;
  }
}
