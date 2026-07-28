import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final trustDeviceServerProvider =
    Provider((ref) => TrustDeviceServer(ref.read(dioProvider)));

const _mutation = 'mutation TrustCurrentDevice { trustCurrentDevice }';

class TrustDeviceServer {
  final Dio _dio;

  TrustDeviceServer(this._dio);

  Future<bool> call() async {
    final response =
        await _dio.post<dynamic>('/graphql', data: {'query': _mutation});
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to trust device',
      );
    }
    return (body['data'] as Map<String, dynamic>)['trustCurrentDevice'] as bool;
  }
}
