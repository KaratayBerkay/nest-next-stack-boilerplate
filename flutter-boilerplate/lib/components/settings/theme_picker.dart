import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../hooks/use_theme.dart';

class ThemePicker extends ConsumerWidget {
  const ThemePicker({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeModeProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Theme'),
        const SizedBox(height: 8),
        SegmentedButton<AppThemeMode>(
          segments: AppThemeMode.values
              .map(
                (m) => ButtonSegment(
                  value: m,
                  label: Text(_labelFor(m)),
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

  String _labelFor(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.light:
        return 'Light';
      case AppThemeMode.dark:
        return 'Dark';
      case AppThemeMode.ocean:
        return 'Ocean';
      case AppThemeMode.violet:
        return 'Violet';
    }
  }
}
