import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../constants/i18n.dart';
import 'use_theme.dart';

final currentLangProvider = Provider<String>((ref) {
  return ref.watch(localeProvider);
});

final isDefaultLangProvider = Provider<bool>((ref) {
  return ref.watch(currentLangProvider) == I18nConstants.defaultLang;
});
