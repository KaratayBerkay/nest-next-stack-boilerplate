import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/auth/user.dart';

final loginServerProvider = Provider((ref) => LoginServer(ref.read(dioProvider)));

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

class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
      };
}

class LoginResponse {
  final String accessToken;
  final AuthenticatedUser user;

  const LoginResponse({required this.accessToken, required this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['accessToken'] as String,
      user: AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
