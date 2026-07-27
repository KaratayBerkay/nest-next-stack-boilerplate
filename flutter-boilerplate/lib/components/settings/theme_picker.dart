import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../hooks/use_theme.dart';
import '../../l10n/app_localizations.dart';

class ThemePicker extends ConsumerWidget {
  const ThemePicker({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeModeProvider);
    final t = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(t.settingsTheme),
        const SizedBox(height: 8),
        SegmentedButton<AppThemeMode>(
          showSelectedIcon: false,
          segments: AppThemeMode.values
              .map(
                (m) => ButtonSegment(
                  value: m,
                  label: Text(_labelFor(t, m)),
                ),
              )
              .toList(),
          selected: {mode},
          onSelectionChanged: (s) {
            ref.read(themeModeProvider.notifier).setMode(s.first);
          },
        ),
      ],
    );
  }

  String _labelFor(AppLocalizations t, AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.light:
        return t.settingsThemeLight;
      case AppThemeMode.dark:
        return t.settingsThemeDark;
      case AppThemeMode.ocean:
        return t.settingsThemeOcean;
      case AppThemeMode.violet:
        return t.settingsThemeViolet;
    }
  }
}
