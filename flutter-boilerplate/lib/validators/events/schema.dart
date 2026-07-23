String? validateEventType(String? value) {
  if (value == null || value.isEmpty) return 'Event type is required';
  if (value.length > 128) return 'Event type must be at most 128 characters';
  return null;
}

String? validateClientSessionId(String? value) {
  if (value == null || value.isEmpty) return 'Client session ID is required';
  if (value.length > 64) return 'Client session ID must be at most 64 characters';
  return null;
}

String? validateTimestamp(String? value) {
  if (value == null || value.isEmpty) return 'Timestamp is required';
  return null;
}

String? validateUserId(String? value) {
  return null;
}

String? validateUrl(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length > 2048) return 'URL must be at most 2048 characters';
  return null;
}

String? validateUserAgent(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length > 512) return 'userAgent must be at most 512 characters';
  return null;
}

String? validateCategory(String? value) {
  if (value == null || value.isEmpty) return null;
  const allowed = [
    'session',
    'page',
    'http-exception',
    'application-exception',
    'network',
    'database',
    'performance',
  ];
  if (!allowed.contains(value)) return 'Invalid category';
  return null;
}

String? validateExceptionType(String? value) {
  if (value == null || value.isEmpty) return null;
  const allowed = ['CLIENT_ERROR', 'CLIENT_REJECTION', 'CLIENT_REQUEST_ERROR'];
  if (!allowed.contains(value)) return 'Invalid exception type';
  return null;
}

String? validateDurationMs(String? value) {
  if (value == null || value.isEmpty) return null;
  if (int.tryParse(value) == null) return 'durationMs must be a number';
  return null;
}

String? validateEventPage(String? value) {
  return null;
}

String? validateBatchSize(int count) {
  if (count < 1) return 'At least one event required';
  if (count > 50) return 'Max 50 events per batch';
  return null;
}
