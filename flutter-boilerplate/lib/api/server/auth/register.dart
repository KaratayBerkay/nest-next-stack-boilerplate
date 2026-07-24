import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/auth_request_types.dart';
import '../../../types/auth/user.dart';

final registerServerProvider =
    Provider((ref) => RegisterServer(ref.read(dioProvider)));

const _mutation = '''
  mutation Register(\$input: RegisterInput!) {
    register(input: \$input) {
      accessToken
      user {
        id
        email
        name
        avatarUrl
        locale
        subscriptionTier
      }
    }
  }
''';

class RegisterServer {
  final Dio _dio;

  RegisterServer(this._dio);

  Future<RegisterResponse> call(RegisterRequest request) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'input': {
            'email': request.email,
            'password': request.password,
            'name': request.name,
          },
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      final msgs = (body['errors'] as List)
          .map((e) => (e as Map<String, dynamic>)['message'] as String?)
          .where((m) => m != null)
          .join(', ');
      throw DioException(
        requestOptions: response.requestOptions,
        message: msgs.isNotEmpty ? msgs : 'Registration failed',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['register']
        as Map<String, dynamic>;
    return RegisterResponse(
      accessToken: result['accessToken'] as String,
      user: AuthenticatedUser.fromJson(
        result['user'] as Map<String, dynamic>,
      ),
    );
  }
}
