import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/auth/auth_request_types.dart';
import '../../../types/auth/user.dart';

final loginServerProvider =
    Provider((ref) => LoginServer(ref.read(dioProvider)));

class LoginServer {
  final Dio _dio;

  LoginServer(this._dio);

  Future<LoginResult> call(LoginRequest request) async {
    final response = await _dio.post<dynamic>(
      Urls.login,
      data: request.toJson(),
    );

    final data = response.data as Map<String, dynamic>;

    if (response.statusCode == 202 || data['mfaRequired'] == true) {
      return LoginMfaRequired(
        mfaToken: data['mfaToken'] as String,
        user: AuthenticatedUser.fromJson(
          data['user'] as Map<String, dynamic>,
        ),
      );
    }

    return LoginSuccess(LoginResponse.fromJson(data));
  }
}
