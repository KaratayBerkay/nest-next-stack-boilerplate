import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final refreshTokenServerProvider =
    Provider((ref) => RefreshTokenServer(ref.read(dioProvider)));

const _mutation = '''
  mutation Refresh {
    refresh {
      accessToken
    }
  }
''';

class RefreshTokenServer {
  final Dio _dio;

  RefreshTokenServer(this._dio);

  Future<String> call(String refreshToken) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _mutation},
      options: Options(headers: {'x-refresh-token': refreshToken}),
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      final msgs = (body['errors'] as List)
          .map((e) => (e as Map<String, dynamic>)['message'] as String?)
          .where((m) => m != null)
          .join(', ');
      throw DioException(
        requestOptions: response.requestOptions,
        message: msgs.isNotEmpty ? msgs : 'Token refresh failed',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['refresh']
        as Map<String, dynamic>;
    return result['accessToken'] as String;
  }
}
