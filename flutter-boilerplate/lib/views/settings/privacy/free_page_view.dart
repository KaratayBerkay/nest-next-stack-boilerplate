import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class FreeSettingsPrivacyPage extends StatelessWidget {
  final String lang;

  const FreeSettingsPrivacyPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.settingsPrivacyHeading)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: SwitchListTile(
              title: Text(t.settingsPrivacyOnlineStatus),
              subtitle: Text(
                'Show when you\'re online',
                style: TextStyle(color: colors.fgMuted, fontSize: 12),
              ),
              value: true,
              onChanged: (_) {},
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Column(
              children: [
                Icon(Icons.lock_outline, size: 40, color: colors.fgMuted),
                const SizedBox(height: 12),
                const Text(
                  'More privacy controls available on higher tiers',
                  style: TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 12),
                Button(
                  child: Text(t.settingsUpgradePlan),
                  onPressed: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
