import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/auth/auth_request_types.dart';

final registerServerProvider =
    Provider((ref) => RegisterServer(ref.read(dioProvider)));

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
