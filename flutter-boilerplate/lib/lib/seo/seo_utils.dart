String generateMetaDescription(String content, int maxLength) {
  final cleaned = content
      .replaceAll(RegExp(r'<[^>]*>'), '')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return '${cleaned.substring(0, maxLength)}...';
}

String stripHtml(String html) {
  return html
      .replaceAll(RegExp(r'<[^>]*>'), '')
      .replaceAll(RegExp(r'&[a-zA-Z]+;'), '')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}
