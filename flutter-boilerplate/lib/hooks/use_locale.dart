import '../lib/riverpod_compat.dart';
import '../constants/i18n.dart';

final localeProvider = StateProvider<String>((ref) => I18nConstants.defaultLang);
