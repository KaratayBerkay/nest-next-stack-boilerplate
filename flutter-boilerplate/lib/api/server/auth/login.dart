import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/auth_request_types.dart';
import '../../../types/auth/user.dart';

final loginServerProvider =
    Provider((ref) => LoginServer(ref.read(dioProvider)));

const _loginMutation = '''
  mutation Login(\$input: LoginInput!) {
    login(input: \$input) {
      accessToken
      refreshToken
      rbacToken
      deviceToken
      userToken
      mfaRequired
      mfaToken
      user {
        id
        email
        name
        avatarUrl
        locale
        subscriptionTier
        role
      }
    }
  }
''';

class LoginServer {
  final Dio _dio;

  LoginServer(this._dio);

  Future<LoginResult> call(LoginRequest request) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _loginMutation,
        'variables': {
          'input': {'email': request.email, 'password': request.password},
        },
      },
    );

    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      final messages = (body['errors'] as List)
          .map((e) => (e as Map<String, dynamic>)['message'] as String?)
          .where((m) => m != null)
          .join(', ');
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: messages.isNotEmpty ? messages : 'Login failed',
      );
    }

    final result =
        (body['data'] as Map<String, dynamic>)['login'] as Map<String, dynamic>;

    if (result['mfaRequired'] == true) {
      return LoginMfaRequired(
        mfaToken: result['mfaToken'] as String,
        user: AuthenticatedUser.fromJson(
          result['user'] as Map<String, dynamic>,
        ),
      );
    }

    return LoginSuccess(
      LoginResponse(
        accessToken: result['accessToken'] as String,
        refreshToken: result['refreshToken'] as String?,
        rbacToken: result['rbacToken'] as String,
        deviceToken: result['deviceToken'] as String,
        userToken: result['userToken'] as String,
        user: AuthenticatedUser.fromJson(
          result['user'] as Map<String, dynamic>,
        ),
      ),
    );
  }
}
