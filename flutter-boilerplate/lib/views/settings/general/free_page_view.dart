import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/settings/theme_picker.dart';
import '../../../l10n/app_localizations.dart';

class FreeSettingsGeneralPage extends ConsumerWidget {
  final String lang;

  const FreeSettingsGeneralPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.settingsGeneralHeading)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: ThemePicker(),
            ),
          ),
        ],
      ),
    );
  }
}
