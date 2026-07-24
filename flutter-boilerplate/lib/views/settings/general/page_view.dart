import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/i18n.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_theme.dart';
import '../../../l10n/app_localizations.dart';

class SettingsGeneralPageContent extends ConsumerWidget {
  final String lang;

  const SettingsGeneralPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: _GeneralSettings(lang: lang),
      basicWidget: _GeneralSettings(lang: lang),
      mediumWidget: _GeneralSettings(lang: lang),
      premiumWidget: _GeneralSettings(lang: lang),
    );
  }
}

class _GeneralSettings extends ConsumerWidget {
  final String lang;

  const _GeneralSettings({required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final currentLocale = ref.watch(localeProvider);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.settingsGeneralHeading)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: Text(t.settingsTheme),
                  subtitle: Text(
                    t.settingsThemeDescription,
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  value: themeMode == AppThemeMode.dark,
                  onChanged: (value) {
                    ref.read(themeModeProvider.notifier).setMode(
                          value ? AppThemeMode.dark : AppThemeMode.light,
                        );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  title: Text(t.settingsLanguage),
                  subtitle: Text(
                    currentLocale.toUpperCase(),
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  trailing: DropdownButton<String>(
                    value: currentLocale,
                    items: I18nConstants.supportedLangs
                        .map(
                          (String l) => DropdownMenuItem<String>(
                            value: l,
                            child: Text(l.toUpperCase()),
                          ),
                        )
                        .toList(),
                    onChanged: (String? v) {
                      if (v != null) {
                        ref.read(localeProvider.notifier).setLocale(v);
                      }
                    },
                    underline: const SizedBox(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
