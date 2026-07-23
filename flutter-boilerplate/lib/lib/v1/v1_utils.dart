String formatV1Path(String path, String lang) {
  final cleanPath = path.startsWith('/') ? path : '/$path';
  return '/v1/$lang$cleanPath';
}

String extractLangFromPath(String path) {
  final parts = path.split('/');
  if (parts.length > 2 && parts[1] == 'v1') {
    return parts[2];
  }
  return 'en';
}
