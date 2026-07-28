import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final verifyEmailServerProvider =
    Provider((ref) => VerifyEmailServer(ref.read(dioProvider)));

const _verifyMutation = '''
  mutation VerifyEmail(\$token: String!) {
    verifyEmail(token: \$token) {
      id
    }
  }
''';

const _verifyCodeMutation = '''
  mutation VerifyEmailCode(\$userId: String!, \$code: String!) {
    verifyEmailCode(userId: \$userId, code: \$code) {
      id
      email
      emailVerifiedAt
    }
  }
''';

const _resendCodeMutation = '''
  mutation ResendEmailCode(\$userId: String!, \$email: String!) {
    resendEmailCode(userId: \$userId, email: \$email)
  }
''';

class VerifyEmailServer {
  final Dio _dio;

  VerifyEmailServer(this._dio);

  Future<void> call(String token) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _verifyMutation,
        'variables': {'token': token},
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
        message: msgs.isNotEmpty ? msgs : 'Email verification failed',
      );
    }
  }

  Future<void> verifyCode(String userId, String code) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _verifyCodeMutation,
        'variables': {'userId': userId, 'code': code},
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
        message: msgs.isNotEmpty ? msgs : 'Email verification failed',
      );
    }
  }

  Future<bool> resendCode(String userId, String email) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _resendCodeMutation,
        'variables': {'userId': userId, 'email': email},
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
        message: msgs.isNotEmpty ? msgs : 'Resend code failed',
      );
    }
    return (body['data'] as Map<String, dynamic>)['resendEmailCode'] as bool;
  }
}
