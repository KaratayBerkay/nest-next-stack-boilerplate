import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/theme.dart';
import '../../../hooks/use_theme.dart';
import '../../../hooks/use_locale.dart';

class PremiumSettingsGeneralPage extends ConsumerStatefulWidget {
  final String lang;

  const PremiumSettingsGeneralPage({super.key, required this.lang});

  @override
  ConsumerState<PremiumSettingsGeneralPage> createState() => _PremiumSettingsGeneralPageState();
}

class _PremiumSettingsGeneralPageState extends ConsumerState<PremiumSettingsGeneralPage> {
  double _fontSize = 1.0;
  bool _experimentalFeatures = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final currentLocale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('General')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Dark Mode'),
                  subtitle: Text('Toggle dark/light theme',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                  value: themeMode == AppThemeMode.dark,
                  onChanged: (value) {
                    ref.read(themeModeProvider.notifier).state =
                        value ? AppThemeMode.dark : AppThemeMode.light;
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  title: const Text('Language'),
                  subtitle: Text(currentLocale.toUpperCase(),
                      style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                ),
                const Divider(height: 1),
                ListTile(
                  title: const Text('Font Size'),
                  subtitle: Text('Adjust text size',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                  trailing: const Icon(Icons.text_fields, size: 20),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Experimental Features'),
                  subtitle: Text('Try upcoming features before release',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                  value: _experimentalFeatures,
                  onChanged: (v) => setState(() => _experimentalFeatures = v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
