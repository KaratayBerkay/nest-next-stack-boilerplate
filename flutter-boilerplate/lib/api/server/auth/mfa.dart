import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final mfaServerProvider = Provider((ref) => MfaServer(ref.read(dioProvider)));

class MfaServer {
  final Dio _dio;

  MfaServer(this._dio);

  Future<Map<String, dynamic>> call(String code) async {
    final response = await _dio.post<dynamic>(Urls.mfa, data: {'code': code});
    return response.data as Map<String, dynamic>;
  }
}
