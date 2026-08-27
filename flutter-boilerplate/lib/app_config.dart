class AppConfig {
  AppConfig._();

  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001',
  );
  static const stripePublishableKey =
      String.fromEnvironment('STRIPE_PUBLISHABLE_KEY');
  static const wsUrl =
      String.fromEnvironment('WS_URL', defaultValue: 'ws://localhost:3001/ws');
  static const livekitUrl = String.fromEnvironment(
    'LIVEKIT_URL',
    defaultValue: 'ws://localhost:7880',
  );

  /// Public origin of the companion web app — used when building links meant
  /// to be shared outside this device (e.g. "Copy link" for a meeting), where
  /// a bare in-app path would be useless to the recipient.
  static const webBaseUrl = String.fromEnvironment(
    'WEB_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );
  static const appEnv =
      String.fromEnvironment('APP_ENV', defaultValue: 'development');
  static const appName = String.fromEnvironment('APP_NAME');
  static const sentryDsn = String.fromEnvironment('SENTRY_DSN');
  static const pushEnabled =
      String.fromEnvironment('PUSH_ENABLED', defaultValue: 'false') == 'true';

  static bool get isProduction => appEnv == 'production';
  static bool get isDevelopment => appEnv == 'development';
}
