import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/oauth_types.dart';

final oauthLoginServerProvider =
    Provider((ref) => OAuthLoginServer(ref.read(dioProvider)));

class OAuthLoginServer {
  final Dio _dio;

  OAuthLoginServer(this._dio);

  /// Redeems a completed handshake. [claim] is the one-time secret the
  /// backend put on the callback redirect; [codeVerifier] is the PKCE-style
  /// verifier whose digest the app registered when starting the flow
  /// (CROSS-032) — the backend refuses the session without both.
  Future<OAuthLoginResponse> call(
    String state, {
    required String claim,
    String? codeVerifier,
  }) async {
    const mutation = '''
      mutation LoginWithOAuth(\$input: OAuthLoginInput!) {
        loginWithOAuth(input: \$input) {
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
            tier: subscriptionTier
            role
          }
        }
      }
    ''';

    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': mutation,
        'variables': {
          'input': {
            'state': state,
            'claim': claim,
            if (codeVerifier != null) 'codeVerifier': codeVerifier,
          },
        },
      },
    );

    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      final messages = (body['errors'] as List)
          .map((e) => (e as Map<String, dynamic>)['message'] as String?)
          .where((m) => m != null)
          .join(', ');
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: messages.isNotEmpty ? messages : 'OAuth login failed',
      );
    }

    final result = (body['data'] as Map<String, dynamic>)['loginWithOAuth']
        as Map<String, dynamic>;
    return OAuthLoginResponse.fromJson(result);
  }
}
