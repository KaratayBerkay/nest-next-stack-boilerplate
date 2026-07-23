class I18nConstants {
  I18nConstants._();

  static const String defaultLang = 'en';
  static const String fallbackLang = 'en';
  static const List<String> supportedLangs = ['en', 'tr'];

  static bool isLocale(String lang) => supportedLangs.contains(lang);
}
