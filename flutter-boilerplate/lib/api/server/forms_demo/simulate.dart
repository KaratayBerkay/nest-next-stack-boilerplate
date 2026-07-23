import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../lib/api_client.dart';

final formSimulateServerProvider = Provider((ref) => FormSimulateServer(ref.read(dioProvider)));

class FormSimulateServer {
  final Dio _dio;

  FormSimulateServer(this._dio);

  Future<Map<String, dynamic>> call(Map<String, dynamic> formData) async {
    final response = await _dio.post<dynamic>('/api/forms-demo/simulate', data: formData);
    return response.data as Map<String, dynamic>;
  }
}
