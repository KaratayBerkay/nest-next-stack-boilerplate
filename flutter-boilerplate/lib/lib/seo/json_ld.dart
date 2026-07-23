import 'dart:convert';

Map<String, dynamic> webApplicationJsonLd(String name, String url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': name,
    'url': url,
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
  };
}

Map<String, dynamic> organizationJsonLd(String name, String url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': name,
    'url': url,
  };
}

String encodeJsonLd(Map<String, dynamic> jsonLd) {
  return jsonEncode(jsonLd);
}
