import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../riverpod_compat.dart';

final messagesProvider = Provider.family<List<LocalizationsDelegate<dynamic>>, String>((ref, locale) {
  return AppLocalizations.localizationsDelegates;
});
