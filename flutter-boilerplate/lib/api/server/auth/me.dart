import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/user.dart';

final meServerProvider = Provider((ref) => MeServer(ref.read(dioProvider)));

const _query = '''
  query Me {
    me {
      id
      email
      name
      avatarUrl
      locale
      subscriptionTier
      sessionId
    }
  }
''';

class MeServer {
  final Dio _dio;

  MeServer(this._dio);

  Future<AuthenticatedUser> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch user',
      );
    }
    final result =
        (body['data'] as Map<String, dynamic>)['me'] as Map<String, dynamic>;
    return AuthenticatedUser.fromJson(result);
  }
}
