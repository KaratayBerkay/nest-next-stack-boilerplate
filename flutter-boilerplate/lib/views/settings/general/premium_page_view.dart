import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/settings/theme_picker.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_theme.dart';
import '../../../l10n/app_localizations.dart';

class PremiumSettingsGeneralPage extends ConsumerStatefulWidget {
  final String lang;

  const PremiumSettingsGeneralPage({super.key, required this.lang});

  @override
  ConsumerState<PremiumSettingsGeneralPage> createState() =>
      _PremiumSettingsGeneralPageState();
}

class _PremiumSettingsGeneralPageState
    extends ConsumerState<PremiumSettingsGeneralPage> {
  bool _experimentalFeatures = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final currentLocale = ref.watch(localeProvider);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.settingsGeneralHeading)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: ThemePicker(),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                ListTile(
                  title: Text(t.settingsLanguage),
                  subtitle: Text(
                    currentLocale.toUpperCase(),
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                ),
                const Divider(height: 1),
                ListTile(
                  title: Text(t.settingsFontSize),
                  subtitle: Text(
                    t.settingsFontSizeDescription,
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
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
                  title: Text(t.settingsExperimentalFeatures),
                  subtitle: Text(
                    t.settingsExperimentalFeaturesDescription,
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
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
