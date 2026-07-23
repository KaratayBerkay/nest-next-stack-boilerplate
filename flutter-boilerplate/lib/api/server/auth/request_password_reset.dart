import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final requestPasswordResetServerProvider = Provider(
  (ref) => RequestPasswordResetServer(ref.read(dioProvider)),
);

class RequestPasswordResetServer {
  final Dio _dio;

  RequestPasswordResetServer(this._dio);

  Future<void> call(String email) async {
    await _dio.post<dynamic>(Urls.requestPasswordReset, data: {'email': email});
  }
}
