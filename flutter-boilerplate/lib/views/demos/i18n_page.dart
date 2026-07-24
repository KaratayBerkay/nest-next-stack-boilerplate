// ignore_for_file: deprecated_member_use, prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/i18n.dart';
import '../../hooks/use_theme.dart';
import '../../l10n/app_localizations.dart';

class I18nDemoPage extends ConsumerWidget {
  final String lang;

  const I18nDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final currentLocale = ref.watch(localeProvider);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoI18nTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Current Language',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ...I18nConstants.supportedLangs.map(
            (l) => RadioListTile<String>(
              title: Text(l),
              value: l,
              groupValue: currentLocale,
              onChanged: (v) {
                if (v != null) ref.read(localeProvider.notifier).setLocale(v);
              },
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Locale Info',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(t.demoI18nActive(currentLocale)),
                  Text(t.demoI18nDefault(I18nConstants.defaultLang)),
                  Text('Fallback: ${I18nConstants.fallbackLang}'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
