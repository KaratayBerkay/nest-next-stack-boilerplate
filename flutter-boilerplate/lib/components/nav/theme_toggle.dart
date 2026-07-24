import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../hooks/use_theme.dart';
import '../../l10n/app_localizations.dart';

class ThemeToggle extends ConsumerWidget {
  const ThemeToggle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final current = ref.watch(themeModeProvider);

    final themeLabels = {
      AppThemeMode.light: t.settingsThemeLight,
      AppThemeMode.dark: t.settingsThemeDark,
      AppThemeMode.ocean: t.settingsThemeOcean,
      AppThemeMode.violet: t.settingsThemeViolet,
    };

    return PopupMenuButton<AppThemeMode>(
      icon: Icon(Icons.palette_outlined, size: 18, color: colors.fgMuted),
      onSelected: (mode) {
        ref.read(themeModeProvider.notifier).setMode(mode);
      },
      itemBuilder: (_) => AppThemeMode.values.map((mode) {
        return PopupMenuItem(
          value: mode,
          child: Row(
            children: [
              if (mode == current)
                Icon(Icons.circle, size: 8, color: colors.brand)
              else
                const SizedBox(width: 8),
              const SizedBox(width: 8),
              Text(themeLabels[mode] ?? mode.name),
            ],
          ),
        );
      }).toList(),
    );
  }
}
