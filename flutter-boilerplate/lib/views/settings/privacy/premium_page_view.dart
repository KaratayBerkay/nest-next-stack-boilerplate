import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class PremiumSettingsPrivacyPage extends StatefulWidget {
  final String lang;

  const PremiumSettingsPrivacyPage({super.key, required this.lang});

  @override
  State<PremiumSettingsPrivacyPage> createState() =>
      _PremiumSettingsPrivacyPageState();
}

class _PremiumSettingsPrivacyPageState
    extends State<PremiumSettingsPrivacyPage> {
  bool _showOnlineStatus = true;
  bool _showReadReceipts = true;
  bool _allowFriendRequests = true;
  bool _shareActivityData = false;

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
            child: Column(
              children: [
                SwitchListTile(
                  title: Text(t.settingsPrivacyOnlineStatus),
                  subtitle: Text(
                    'Show when you\'re online',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  value: _showOnlineStatus,
                  onChanged: (v) => setState(() => _showOnlineStatus = v),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: Text(t.settingsPrivacyReadReceipts),
                  subtitle: Text(
                    'Let others know you\'ve read their messages',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  value: _showReadReceipts,
                  onChanged: (v) => setState(() => _showReadReceipts = v),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Friend Requests'),
                  subtitle: Text(
                    'Allow anyone to send you friend requests',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  value: _allowFriendRequests,
                  onChanged: (v) => setState(() => _allowFriendRequests = v),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Share Activity Data'),
                  subtitle: Text(
                    'Help us improve with usage analytics',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  value: _shareActivityData,
                  onChanged: (v) => setState(() => _shareActivityData = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: ListTile(
              leading: Icon(Icons.download_outlined, color: colors.brand),
              title: const Text('Export My Data'),
              subtitle: Text(
                'Download all your data',
                style: TextStyle(color: colors.fgMuted, fontSize: 12),
              ),
              trailing: const Icon(Icons.arrow_forward_ios, size: 14),
              onTap: () {},
            ),
          ),
        ],
      ),
    );
  }
}
