import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final usernameAvailableServerProvider = Provider(
  (ref) => UsernameAvailableServer(ref.read(dioProvider)),
);

class UsernameAvailableServer {
  final Dio _dio;

  UsernameAvailableServer(this._dio);

  Future<bool> call(String username) async {
    final response = await _dio.get<dynamic>(
      Urls.usernameAvailable,
      queryParameters: {
        'username': username,
      },
    );
    return response.data['available'] as bool;
  }
}
