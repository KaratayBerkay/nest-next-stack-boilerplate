import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final meRawServerProvider =
    Provider((ref) => MeRawServer(ref.read(dioProvider)));

const _query = 'query Me { me { id email name avatarUrl sessionId } }';

class MeRawServer {
  final Dio _dio;

  MeRawServer(this._dio);

  Future<AuthMeResult> call() async {
    try {
      final response = await _dio.post<dynamic>(
        '/graphql',
        data: {'query': _query},
      );
      final body = response.data as Map<String, dynamic>;
      if (body['errors'] != null || body['data'] == null) {
        return AuthMeResult(authed: false);
      }
      final result =
          (body['data'] as Map<String, dynamic>)['me'] as Map<String, dynamic>?;
      if (result == null) return AuthMeResult(authed: false);
      return AuthMeResult(
        authed: true,
        session: result['sessionId'] as String?,
      );
    } on DioException {
      return AuthMeResult(authed: false);
    }
  }
}

class AuthMeResult {
  final bool authed;
  final String? session;

  const AuthMeResult({required this.authed, this.session});
}
