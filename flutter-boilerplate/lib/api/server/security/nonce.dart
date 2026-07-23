import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final nonceServerProvider = Provider((ref) => NonceServer(ref.read(dioProvider)));

class NonceServer {
  final Dio _dio;

  NonceServer(this._dio);

  Future<String> call() async {
    final response = await _dio.get<dynamic>(Urls.securityNonce);
    return response.data['nonce'] as String;
  }
}
