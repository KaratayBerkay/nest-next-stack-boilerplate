import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class SecurityPageContent extends ConsumerWidget {
  final String lang;

  const SecurityPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.securityTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: Text(t.securityTwoFactor),
                  subtitle: Text(
                    'Add an extra layer of security',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  value: false,
                  onChanged: (_) {},
                ),
                const Divider(height: 1),
                ListTile(
                  title: Text(t.securityChangePassword),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  title: Text(t.securityActiveSessions),
                  subtitle: Text(
                    'Manage your logged-in devices',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
