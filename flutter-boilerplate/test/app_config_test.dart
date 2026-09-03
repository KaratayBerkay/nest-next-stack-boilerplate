import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/app_config.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  // `flutter test` passes no dart-defines, so these observe the defaults —
  // exactly the situation a build that forgot `--dart-define-from-file`
  // would be in.
  group('AppConfig defaults (MOB-041)', () {
    test('APP_ENV defaults to production so a define-less build fails closed',
        () {
      expect(AppConfig.appEnv, 'production');
      expect(AppConfig.isProduction, isTrue);
      expect(AppConfig.isDevelopment, isFalse);
    });
  });

  group('dioProvider request/response logging (MOB-041)', () {
    test('installs no LogInterceptor unless the build is a development one',
        () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final dio = container.read(dioProvider);

      // LogInterceptor prints the Authorization/x-*-token headers and full
      // response bodies; it must never be present in a non-development
      // configuration (and, separately, never in a release binary).
      expect(dio.interceptors.whereType<LogInterceptor>(), isEmpty);
      expect(dio.interceptors.whereType<AuthInterceptor>(), hasLength(1));
    });
  });
}
