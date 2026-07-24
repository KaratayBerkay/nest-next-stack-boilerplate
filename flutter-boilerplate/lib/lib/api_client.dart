import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/server/auth/refresh_token.dart';
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

class AuthInterceptor extends Interceptor {
  final Ref _ref;
  bool _isRefreshing = false;

  AuthInterceptor(this._ref);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _ref.read(authProvider.notifier).getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
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
      final refreshToken = await authNotifier.getRefreshToken();
      if (refreshToken == null) {
        authNotifier.logout();
        handler.next(err);
        return;
      }

      final refreshServer = RefreshTokenServer(
        Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl)),
      );
      final newToken = await refreshServer.call(refreshToken);

      // Retry the original request
      err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
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
