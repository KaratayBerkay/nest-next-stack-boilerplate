import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final verifyEmailServerProvider =
    Provider((ref) => VerifyEmailServer(ref.read(dioProvider)));

const _mutation = '''
  mutation VerifyEmail(\$token: String!) {
    verifyEmail(token: \$token) {
      id
    }
  }
''';

class VerifyEmailServer {
  final Dio _dio;

  VerifyEmailServer(this._dio);

  Future<void> call(String token) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
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
}
