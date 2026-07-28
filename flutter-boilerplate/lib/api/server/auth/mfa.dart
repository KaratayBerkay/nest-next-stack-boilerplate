import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_boilerplate/types/auth/mfa_types.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final mfaServerProvider = Provider((ref) => MfaServer(ref.read(dioProvider)));

const _verifyLoginMutation = '''
  mutation VerifyLoginMfa(\$input: VerifyLoginMfaInput!) {
    verifyLoginMfa(input: \$input) {
      accessToken
      refreshToken
      rbacToken
      deviceToken
      userToken
      user {
        id
        email
        name
        avatarUrl
        locale
        subscriptionTier
        mfaEnabled
      }
    }
  }
''';

const _enrollMutation = '''
  mutation EnrollMfa {
    enrollMfa {
      otpauthUrl
      secret
    }
  }
''';

const _verifyMutation = '''
  mutation VerifyMfa(\$code: String!) {
    verifyMfa(code: \$code) {
      enabled
      backupCodes
    }
  }
''';

const _disableMutation = '''
  mutation DisableMfa(\$code: String!) {
    disableMfa(code: \$code)
  }
''';

const _resendLoginCodeMutation = '''
  mutation ResendLoginCode(\$mfaToken: String!) {
    resendLoginCode(mfaToken: \$mfaToken)
  }
''';

class MfaServer {
  final Dio _dio;

  MfaServer(this._dio);

  Future<Map<String, dynamic>> verifyLoginMfa(
    String mfaToken,
    String code,
  ) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _verifyLoginMutation,
        'variables': {
          'input': {'mfaToken': mfaToken, 'code': code},
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
        response: response,
        message: msgs.isNotEmpty ? msgs : 'MFA verification failed',
      );
    }
    return (body['data'] as Map<String, dynamic>)['verifyLoginMfa']
        as Map<String, dynamic>;
  }

  Future<EnrollMfaResponse> enrollMfa() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _enrollMutation},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      final msgs = (body['errors'] as List)
          .map((e) => (e as Map<String, dynamic>)['message'] as String?)
          .where((m) => m != null)
          .join(', ');
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: msgs.isNotEmpty ? msgs : 'MFA enroll failed',
      );
    }
    return EnrollMfaResponse.fromJson(
      (body['data'] as Map<String, dynamic>)['enrollMfa']
          as Map<String, dynamic>,
    );
  }

  Future<VerifyMfaResponse> verifyMfa(String code) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _verifyMutation,
        'variables': {'code': code},
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
        response: response,
        message: msgs.isNotEmpty ? msgs : 'MFA verify failed',
      );
    }
    return VerifyMfaResponse.fromJson(
      (body['data'] as Map<String, dynamic>)['verifyMfa']
          as Map<String, dynamic>,
    );
  }

  Future<bool> disableMfa(String code) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _disableMutation,
        'variables': {'code': code},
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
        response: response,
        message: msgs.isNotEmpty ? msgs : 'MFA disable failed',
      );
    }
    return (body['data'] as Map<String, dynamic>)['disableMfa'] as bool;
  }

  Future<String> resendLoginCode(String mfaToken) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _resendLoginCodeMutation,
        'variables': {'mfaToken': mfaToken},
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
        response: response,
        message: msgs.isNotEmpty ? msgs : 'Resend login code failed',
      );
    }
    return (body['data'] as Map<String, dynamic>)['resendLoginCode'] as String;
  }
}
