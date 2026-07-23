String? validateAppUrl(String? value) {
  if (value == null || value.isEmpty) return 'App URL is required';
  final uri = Uri.tryParse(value);
  if (uri == null || !uri.hasScheme || !uri.host.isNotEmpty) return 'Must be a valid URL';
  return null;
}

String? validateWsUrl(String? value) {
  if (value == null || value.isEmpty) return 'Realtime WS URL is required';
  final wsRegex = RegExp(r'^(\/|wss?:\/\/)');
  if (!wsRegex.hasMatch(value)) return 'Expected a ws://, wss://, or /path URL';
  return null;
}

String? validateVapidPublicKey(String? value) {
  if (value == null || value.isEmpty) return 'VAPID public key is required';
  return null;
}

String? validateStripeKey(String? value) {
  if (value == null || value.isEmpty) return 'Stripe key is required';
  return null;
}

String? validateNodeEnv(String? value) {
  if (value == null || value.isEmpty) return 'NODE_ENV is required';
  if (!['development', 'test', 'production'].contains(value)) return 'Must be development, test, or production';
  return null;
}

String? validateCookieDomain(String? value) {
  if (value == null || value.isEmpty) return null;
  return null;
}

String? validateCookieSameSite(String? value) {
  if (value == null || value.isEmpty) return 'Cookie samesite is required';
  if (!['lax', 'strict', 'none'].contains(value.toLowerCase())) return 'Must be lax, strict, or none';
  return null;
}

String? validateKafkaBroker(String? value) {
  if (value == null || value.isEmpty) return 'KAFKA_BROKER is required';
  return null;
}

String? validateFieldStateError(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length < 3) return 'This field has an error';
  return null;
}
