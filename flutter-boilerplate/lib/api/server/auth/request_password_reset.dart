import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final requestPasswordResetServerProvider = Provider(
  (ref) => RequestPasswordResetServer(ref.read(dioProvider)),
);

const _mutation = '''
  mutation RequestPasswordReset(\$input: RequestPasswordResetInput!) {
    requestPasswordReset(input: \$input)
  }
''';

class RequestPasswordResetServer {
  final Dio _dio;

  RequestPasswordResetServer(this._dio);

  Future<void> call(String email) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'input': {'email': email},
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
        message: msgs.isNotEmpty ? msgs : 'Password reset request failed',
      );
    }
  }
}
