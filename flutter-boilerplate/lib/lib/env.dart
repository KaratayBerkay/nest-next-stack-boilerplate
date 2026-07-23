class Env {
  Env._();

  static String get apiBaseUrl =>
      const String.fromEnvironment('API_BASE_URL',
          defaultValue: 'http://localhost:3001');

  static String get stripePublishableKey =>
      const String.fromEnvironment('STRIPE_PUBLISHABLE_KEY',
          defaultValue: '');

  static bool get isProduction =>
      const bool.fromEnvironment('APP_ENV', defaultValue: false);
}
