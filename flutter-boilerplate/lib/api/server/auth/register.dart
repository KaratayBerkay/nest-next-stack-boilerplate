import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final registerServerProvider = Provider((ref) => RegisterServer(ref.read(dioProvider)));

class RegisterServer {
  final Dio _dio;

  RegisterServer(this._dio);

  Future<RegisterResponse> call(RegisterRequest request) async {
    final response = await _dio.post<dynamic>(
      Urls.register,
      data: request.toJson(),
    );
    return RegisterResponse.fromJson(response.data as Map<String, dynamic>);
  }
}

class RegisterRequest {
  final String email;
  final String password;
  final String name;

  const RegisterRequest({
    required this.email,
    required this.password,
    required this.name,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
        'name': name,
      };
}

class RegisterResponse {
  final String accessToken;

  const RegisterResponse({required this.accessToken});

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      accessToken: json['accessToken'] as String,
    );
  }
}
