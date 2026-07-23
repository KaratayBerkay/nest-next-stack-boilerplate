import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dataServerProvider = Provider((ref) => DataServer(ref.read(dioProvider)));

class DataServer {
  final Dio _dio;

  DataServer(this._dio);

  Future<Map<String, dynamic>> get(String key) async {
    final response = await _dio.get<dynamic>('/api/data/$key');
    return response.data as Map<String, dynamic>;
  }

  Future<void> set(String key, Map<String, dynamic> value) async {
    await _dio.put<dynamic>('/api/data/$key', data: value);
  }
}
