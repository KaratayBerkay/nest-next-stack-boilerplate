import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final deviceHandshakeServerProvider = Provider(
  (ref) => DeviceHandshakeServer(ref.read(dioProvider)),
);

class DeviceHandshakeServer {
  final Dio _dio;

  DeviceHandshakeServer(this._dio);

  Future<Map<String, dynamic>> call(String deviceToken) async {
    final response = await _dio.post<dynamic>(Urls.deviceHandshake, data: {
      'deviceToken': deviceToken,
    });
    return response.data as Map<String, dynamic>;
  }
}
