import 'package:flutter/material.dart';

import '../settings_shell.dart';
import 'message_storage_card.dart';
import 'upload_storage_card.dart';

/// Mirrors next-js-boilerplate's `views/settings/usage/PageContent.tsx` —
/// no tier gating on web (no Free/Basic/Medium/Premium view files exist for
/// this feature), so this is a single flat page.
class SettingsUsagePageContent extends StatelessWidget {
  final String lang;

  const SettingsUsagePageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return SettingsShellScaffold(
      lang: lang,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          UploadStorageCard(),
          SizedBox(height: 16),
          MessageStorageCard(),
        ],
      ),
    );
  }
}
