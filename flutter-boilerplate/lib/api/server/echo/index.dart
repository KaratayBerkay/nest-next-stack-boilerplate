import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../lib/api_client.dart';

final echoServerProvider = Provider((ref) => EchoServer(ref.read(dioProvider)));

class EchoServer {
  final Dio _dio;

  EchoServer(this._dio);

  Future<Map<String, dynamic>> call(Map<String, dynamic> payload) async {
    final response = await _dio.post<dynamic>('/api/echo', data: payload);
    return response.data as Map<String, dynamic>;
  }
}
