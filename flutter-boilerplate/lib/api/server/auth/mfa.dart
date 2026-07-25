import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final mfaServerProvider = Provider((ref) => MfaServer(ref.read(dioProvider)));

const _mutation = '''
  mutation VerifyLoginMfa(\$input: VerifyLoginMfaInput!) {
    verifyLoginMfa(input: \$input) {
      accessToken
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
      }
    }
  }
''';

class MfaServer {
  final Dio _dio;

  MfaServer(this._dio);

  Future<Map<String, dynamic>> call(String mfaToken, String code) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
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
        message: msgs.isNotEmpty ? msgs : 'MFA verification failed',
      );
    }
    return (body['data'] as Map<String, dynamic>)['verifyLoginMfa']
        as Map<String, dynamic>;
  }
}
