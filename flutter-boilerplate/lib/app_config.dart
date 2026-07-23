import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  AppConfig._();

  static String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://localhost:3001';

  static String get stripePublishableKey =>
      dotenv.env['STRIPE_PUBLISHABLE_KEY'] ?? '';

  static String get wsUrl => dotenv.env['WS_URL'] ?? 'ws://localhost:3001/ws';

  static String get appEnv => dotenv.env['APP_ENV'] ?? 'development';

  static String get appName => dotenv.env['APP_NAME'] ?? 'flutter-boilerplate';

  static String get sentryDsn => dotenv.env['SENTRY_DSN'] ?? '';

  static bool get isProduction => appEnv == 'production';
  static bool get isDevelopment => appEnv == 'development';
}
