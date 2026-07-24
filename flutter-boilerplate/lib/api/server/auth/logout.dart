import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final logoutServerProvider =
    Provider((ref) => LogoutServer(ref.read(dioProvider)));

const _mutation = 'mutation Logout { logout }';

class LogoutServer {
  final Dio _dio;

  LogoutServer(this._dio);

  Future<void> call() async {
    await _dio.post<dynamic>('/graphql', data: {'query': _mutation});
  }
}
