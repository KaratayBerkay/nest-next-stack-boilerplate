import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final resetPasswordServerProvider = Provider((ref) => ResetPasswordServer(ref.read(dioProvider)));

class ResetPasswordServer {
  final Dio _dio;

  ResetPasswordServer(this._dio);

  Future<void> call(String token, String password) async {
    await _dio.post<dynamic>(Urls.resetPassword, data: {
      'token': token,
      'password': password,
    },);
  }
}
