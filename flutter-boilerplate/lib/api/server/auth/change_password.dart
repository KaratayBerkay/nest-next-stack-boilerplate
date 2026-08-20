import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final changePasswordServerProvider =
    Provider((ref) => ChangePasswordServer(ref.read(dioProvider)));

const _changePasswordMutation = '''
  mutation ChangePassword(\$input: ChangePasswordInput!) {
    changePassword(input: \$input)
  }
''';

const _undoPasswordChangeMutation = '''
  mutation UndoPasswordChange(\$token: String!) {
    undoPasswordChange(token: \$token)
  }
''';

class ChangePasswordServer {
  final Dio _dio;

  ChangePasswordServer(this._dio);

  Future<void> call(String currentPassword, String newPassword) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _changePasswordMutation,
        'variables': {
          'input': {
            'currentPassword': currentPassword,
            'newPassword': newPassword,
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
        response: response,
        message: msgs.isNotEmpty ? msgs : 'Password change failed',
      );
    }
  }

  Future<void> undoPasswordChange(String token) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _undoPasswordChangeMutation,
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
        response: response,
        message: msgs.isNotEmpty ? msgs : 'Undo password change failed',
      );
    }
  }
}
