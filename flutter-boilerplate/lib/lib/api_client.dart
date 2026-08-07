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
  if (AppConfig.isDevelopment) {
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
  bool _isRefreshing = false;

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

    if (_isRefreshing) {
      handler.next(err);
      return;
    }

    _isRefreshing = true;
    try {
      final authNotifier = _ref.read(authProvider.notifier);
      final refreshed = await authNotifier.refreshAccessToken();
      if (!refreshed) {
        authNotifier.logout();
        handler.next(err);
        return;
      }

      final tokens = await authNotifier.getAuthTokens();
      if (tokens == null) {
        authNotifier.logout();
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
    } finally {
      _isRefreshing = false;
    }
  }
}
