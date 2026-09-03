import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../app_config.dart';
import '../hooks/use_auth.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  dio.interceptors.add(AuthInterceptor(ref));
  // Dio's LogInterceptor prints every request's headers (the Authorization
  // bearer plus the three x-*-token headers) and, with responseBody, every
  // response body (login/refresh payloads carry refresh tokens, message
  // endpoints carry decrypted content). `debugPrint` is NOT stripped from
  // release binaries, so this is gated on the compile-time kDebugMode and
  // never on APP_ENV alone — that is just a string a build can get wrong,
  // and the compose Dockerfile did ship release APKs built with
  // APP_ENV=development (MOB-041).
  if (kDebugMode && AppConfig.isDevelopment) {
    dio.interceptors.add(
      LogInterceptor(
        responseBody: true,
        logPrint: (o) => debugPrint('[API] $o'),
      ),
    );
  }

  return dio;
});

/// The same 4 headers [AuthInterceptor] attaches to every Dio request, for
/// callers that can't go through Dio directly (e.g. `CachedNetworkImage`'s
/// `httpHeaders`, which needs a resolved header map rather than an
/// interceptor).
final authHeadersProvider = FutureProvider<Map<String, String>?>((ref) async {
  final tokens = await ref.read(authProvider.notifier).getAuthTokens();
  if (tokens == null) return null;
  return {
    'Authorization': 'Bearer ${tokens['accessToken']}',
    'x-rbac-token': tokens['rbacToken']!,
    'x-device-token': tokens['deviceToken']!,
    'x-user-token': tokens['userToken']!,
  };
});

class AuthInterceptor extends Interceptor {
  final Ref _ref;
  Future<bool>? _refreshFuture;

  AuthInterceptor(this._ref);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final tokens = await _ref.read(authProvider.notifier).getAuthTokens();
    if (tokens != null) {
      options.headers['Authorization'] = 'Bearer ${tokens['accessToken']}';
      options.headers['x-rbac-token'] = tokens['rbacToken'];
      options.headers['x-device-token'] = tokens['deviceToken'];
      options.headers['x-user-token'] = tokens['userToken'];
    }
    handler.next(options);
  }

  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    // Backend GraphQL errors always come back as HTTP 200 with the real
    // status in `errors[0].extensions.statusCode`, so an expired access
    // token never surfaces as a 401 for Dio to catch on its own — recreate
    // that signal here so it shares the retry logic below.
    if (response.requestOptions.path == '/graphql' &&
        _graphQlErrorStatusCode(response.data) == 401) {
      handler.reject(
        DioException(
          requestOptions: response.requestOptions,
          response: response..statusCode = 401,
          type: DioExceptionType.badResponse,
          message: 'GraphQL request unauthenticated',
        ),
        true, // let onError below run — a plain reject() would skip straight past it
      );
      return;
    }
    handler.next(response);
  }

  int? _graphQlErrorStatusCode(dynamic body) {
    if (body is! Map<String, dynamic>) return null;
    final errors = body['errors'];
    if (errors is! List || errors.isEmpty) return null;
    final first = errors.first;
    if (first is! Map<String, dynamic>) return null;
    final extensions = first['extensions'];
    if (extensions is! Map<String, dynamic>) return null;
    return extensions['statusCode'] as int?;
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      handler.next(err);
      return;
    }

    // Single-flight refresh: every concurrent 401 awaits the SAME
    // in-progress refresh and retries with its result, instead of the old
    // plain-bool guard's failure mode where only the first 401 refreshed
    // and every other concurrent 401 gave up immediately with no retry —
    // e.g. opening a chat fires the conversation, messages, and presence
    // requests together, and whichever ones lost the race would 401
    // permanently (surfacing as "Failed to load messages" even though the
    // session was fine seconds later). The backend also rotates the
    // refresh token on every use, so a second concurrent refresh attempt
    // would itself just fail on an already-consumed token — one shared
    // Future is required, not merely serializing separate attempts.
    final refreshed = await (_refreshFuture ??= _refreshOnce());

    if (!refreshed) {
      handler.next(err);
      return;
    }

    try {
      final tokens = await _ref.read(authProvider.notifier).getAuthTokens();
      if (tokens == null) {
        _ref.read(authProvider.notifier).logout();
        handler.next(err);
        return;
      }

      err.requestOptions.headers['Authorization'] =
          'Bearer ${tokens['accessToken']}';
      err.requestOptions.headers['x-rbac-token'] = tokens['rbacToken'];
      err.requestOptions.headers['x-device-token'] = tokens['deviceToken'];
      err.requestOptions.headers['x-user-token'] = tokens['userToken'];
      final response = await Dio().fetch<dynamic>(err.requestOptions);
      handler.resolve(response);
    } catch (_) {
      _ref.read(authProvider.notifier).logout();
      handler.next(err);
    }
  }

  Future<bool> _refreshOnce() async {
    final authNotifier = _ref.read(authProvider.notifier);
    try {
      final result = await authNotifier.refreshAccessToken();
      // Only an explicit rejection ends the session — a network-layer
      // failure (MOB-037) leaves the still-possibly-valid tokens in place
      // so the next request gets a fresh chance once connectivity recovers,
      // instead of permanently logging the user out over a transient blip.
      // Awaited on purpose: the rejected request must not surface to its
      // caller until the dead session is actually cleared, or a screen can
      // react to the 401 by retrying against tokens that are mid-deletion.
      if (result == RefreshResult.authRejected) await authNotifier.logout();
      return result == RefreshResult.success;
    } finally {
      _refreshFuture = null;
    }
  }
}
