import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final verifyEmailServerProvider = Provider((ref) => VerifyEmailServer(ref.read(dioProvider)));

class VerifyEmailServer {
  final Dio _dio;

  VerifyEmailServer(this._dio);

  Future<void> call(String token) async {
    await _dio.post<dynamic>(Urls.verifyEmail, data: {'token': token});
  }
}
