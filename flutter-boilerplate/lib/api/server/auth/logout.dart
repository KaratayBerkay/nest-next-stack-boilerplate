import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final logoutServerProvider = Provider((ref) => LogoutServer(ref.read(dioProvider)));

class LogoutServer {
  final Dio _dio;

  LogoutServer(this._dio);

  Future<void> call() async {
    await _dio.post<dynamic>(Urls.logout);
  }
}
