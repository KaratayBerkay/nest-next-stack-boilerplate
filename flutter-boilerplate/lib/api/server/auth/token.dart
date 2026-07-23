import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final tokenServerProvider = Provider((ref) => TokenServer(ref.read(dioProvider)));

class TokenServer {
  final Dio _dio;

  TokenServer(this._dio);

  Future<RefreshTokenResult?> call() async {
    try {
      final response = await _dio.get<dynamic>(Urls.token);
      final data = response.data as Map<String, dynamic>?;
      if (data == null) return null;
      return RefreshTokenResult(
        accessToken: data['accessToken'] as String?,
      );
    } on DioException {
      return null;
    }
  }
}

class RefreshTokenResult {
  final String? accessToken;

  const RefreshTokenResult({this.accessToken});
}
