import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final tokenServerProvider =
    Provider((ref) => TokenServer(ref.read(dioProvider)));

const _mutation = 'mutation Refresh { refresh { accessToken } }';

class TokenServer {
  final Dio _dio;

  TokenServer(this._dio);

  Future<RefreshTokenResult?> call() async {
    try {
      final response = await _dio.post<dynamic>(
        '/graphql',
        data: {'query': _mutation},
      );
      final body = response.data as Map<String, dynamic>;
      if (body['errors'] != null) return null;
      final result = (body['data'] as Map<String, dynamic>)['refresh']
          as Map<String, dynamic>?;
      if (result == null) return null;
      return RefreshTokenResult(
        accessToken: result['accessToken'] as String?,
      );
    } on DioException {
      return null;
    }
  }
}

class RefreshTokenResult {
  final String? accessToken;

  const RefreshTokenResult({this.accessToken});
}
