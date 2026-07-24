import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final refreshTokenServerProvider =
    Provider((ref) => RefreshTokenServer(ref.read(dioProvider)));

class RefreshTokenServer {
  final Dio _dio;

  RefreshTokenServer(this._dio);

  Future<String> call(String refreshToken) async {
    final response = await _dio.post<dynamic>(
      Urls.token,
      data: {
        'refreshToken': refreshToken,
      },
    );
    return response.data['accessToken'] as String;
  }
}
