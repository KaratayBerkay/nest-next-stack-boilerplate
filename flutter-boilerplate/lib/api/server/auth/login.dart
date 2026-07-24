import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/auth/auth_request_types.dart';

final loginServerProvider =
    Provider((ref) => LoginServer(ref.read(dioProvider)));

class LoginServer {
  final Dio _dio;

  LoginServer(this._dio);

  Future<LoginResponse> call(LoginRequest request) async {
    final response = await _dio.post<dynamic>(
      Urls.login,
      data: request.toJson(),
    );
    return LoginResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
