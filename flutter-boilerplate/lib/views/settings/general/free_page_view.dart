import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/theme.dart';
import '../../../hooks/use_theme.dart';

class FreeSettingsGeneralPage extends ConsumerWidget {
  final String lang;

  const FreeSettingsGeneralPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('General')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: SwitchListTile(
              title: const Text('Dark Mode'),
              subtitle: Text('Toggle dark/light theme',
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),),
              value: themeMode == AppThemeMode.dark,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).state =
                    value ? AppThemeMode.dark : AppThemeMode.light;
              },
            ),
          ),
        ],
      ),
    );
  }
}
