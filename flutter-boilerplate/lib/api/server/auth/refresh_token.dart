import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final refreshTokenServerProvider =
    Provider((ref) => RefreshTokenServer(ref.read(dioProvider)));

const _mutation = '''
  mutation Refresh {
    refresh {
      accessToken
      refreshToken
      rbacToken
      deviceToken
      userToken
    }
  }
''';

class RefreshTokenServer {
  final Dio _dio;

  RefreshTokenServer(this._dio);

  /// `refresh` is CSRF-guarded server-side (double-submit cookie, see
  /// nest-js-boilerplate/src/csrf/csrf.guard.ts) — it 403s unless the caller
  /// echoes a token from `GET /csrf/token` back as both the `x-csrf-token`
  /// header and the cookie that endpoint sets, regardless of whether
  /// `x-refresh-token` itself is valid. See convert-frontend-7-flutter.md §13.
  Future<Map<String, String>> _fetchCsrfHeaders() async {
    final response = await _dio.get<dynamic>('/csrf/token');
    final body = response.data as Map<String, dynamic>;
    final token = body['token'] as String?;
    if (token == null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch CSRF token',
      );
    }
    final setCookie = response.headers['set-cookie'];
    final cookie = setCookie != null && setCookie.isNotEmpty
        ? setCookie.first.split(';').first
        : null;
    return {
      'x-csrf-token': token,
      if (cookie != null) 'cookie': cookie,
    };
  }

  /// The backend rotates the refresh token on every use — the old one's
  /// Redis TTL is fixed from creation time and never renewed on reuse (see
  /// convert-frontend-7-flutter.md §16), so the caller must persist the new
  /// `refreshToken` here or every session hard-expires ~`SESSION_TTL` after
  /// login regardless of how many successful refreshes happen in between.
  ///
  /// Also sends the existing rbac/device/user tokens alongside the refresh
  /// token — the backend keys the renewed session on all four together, so
  /// omitting any of them makes the new access token unusable the instant
  /// it's issued (the next request presents the real device token, which
  /// can never match a session keyed on a blank one).
  ///
  /// The response carries a freshly ROTATED rbac/device/user trio too: the
  /// backend revokes the old compound Redis key as part of this call and
  /// keys the new session on the rotated values
  /// (`auth-session.service.ts`'s `refresh()`), so the caller must persist
  /// all three or the very next authenticated request 401s again
  /// (`session_miss`) even though this refresh itself succeeded.
  Future<
      ({
        String accessToken,
        String refreshToken,
        String rbacToken,
        String deviceToken,
        String userToken,
      })> call(
    String refreshToken, {
    required String rbacToken,
    required String deviceToken,
    required String userToken,
  }) async {
    final csrfHeaders = await _fetchCsrfHeaders();
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _mutation},
      options: Options(
        headers: {
          'x-refresh-token': refreshToken,
          'x-rbac-token': rbacToken,
          'x-device-token': deviceToken,
          'x-user-token': userToken,
          ...csrfHeaders,
        },
      ),
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      final errors = body['errors'] as List;
      final msgs = errors
          .map((e) => (e as Map<String, dynamic>)['message'] as String?)
          .where((m) => m != null)
          .join(', ');
      // Mirrors AuthInterceptor._graphQlErrorStatusCode: this backend always
      // answers GraphQL errors with HTTP 200, the real status buried in
      // extensions.statusCode — an expired/invalid refresh token throws
      // UnauthorizedException server-side and lands here. Without surfacing
      // that as response.statusCode, classifyRefreshFailure() (which only
      // inspects error.response?.statusCode) can never see it, misreads a
      // real rejection as a transient network blip, and leaves the dead
      // refresh token in storage forever — an infinite retry loop instead of
      // the clean logout MOB-037 intended. Reproduced live: both long-running
      // QA sessions stuck permanently retrying an already-rejected token.
      final statusCode = _errorStatusCode(errors);
      throw DioException(
        requestOptions: response.requestOptions,
        response:
            statusCode != null ? (response..statusCode = statusCode) : response,
        type: statusCode != null
            ? DioExceptionType.badResponse
            : DioExceptionType.unknown,
        message: msgs.isNotEmpty ? msgs : 'Token refresh failed',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['refresh']
        as Map<String, dynamic>;
    return (
      accessToken: result['accessToken'] as String,
      refreshToken: result['refreshToken'] as String,
      rbacToken: result['rbacToken'] as String,
      deviceToken: result['deviceToken'] as String,
      userToken: result['userToken'] as String,
    );
  }

  int? _errorStatusCode(List<dynamic> errors) {
    if (errors.isEmpty) return null;
    final first = errors.first;
    if (first is! Map<String, dynamic>) return null;
    final extensions = first['extensions'];
    if (extensions is! Map<String, dynamic>) return null;
    return extensions['statusCode'] as int?;
  }
}
