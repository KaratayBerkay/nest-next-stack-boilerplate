import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final usernameAvailableServerProvider = Provider(
  (ref) => UsernameAvailableServer(ref.read(dioProvider)),
);

const _query =
    'query IsUsernameAvailable(\$username: String!) { isUsernameAvailable(username: \$username) }';

class UsernameAvailableServer {
  final Dio _dio;

  UsernameAvailableServer(this._dio);

  Future<bool> call(String username) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {'username': username},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to check username availability',
      );
    }
    return (body['data'] as Map<String, dynamic>)['isUsernameAvailable']
        as bool;
  }
}
