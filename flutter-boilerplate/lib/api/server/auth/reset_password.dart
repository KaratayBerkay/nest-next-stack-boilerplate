import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final resetPasswordServerProvider =
    Provider((ref) => ResetPasswordServer(ref.read(dioProvider)));

const _mutation = '''
  mutation ResetPassword(\$input: ResetPasswordInput!) {
    resetPassword(input: \$input)
  }
''';

class ResetPasswordServer {
  final Dio _dio;

  ResetPasswordServer(this._dio);

  Future<void> call(String token, String password) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'input': {'token': token, 'newPassword': password},
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
        message: msgs.isNotEmpty ? msgs : 'Password reset failed',
      );
    }
  }
}
