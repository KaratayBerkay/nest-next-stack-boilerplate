import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class MediumSettingsPrivacyPage extends StatefulWidget {
  final String lang;

  const MediumSettingsPrivacyPage({super.key, required this.lang});

  @override
  State<MediumSettingsPrivacyPage> createState() =>
      _MediumSettingsPrivacyPageState();
}

class _MediumSettingsPrivacyPageState extends State<MediumSettingsPrivacyPage> {
  bool _showOnlineStatus = true;
  bool _showReadReceipts = true;
  bool _allowFriendRequests = true;

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
                  title: Text(t.settingsPrivacyFriendRequests),
                  subtitle: Text(
                    'Allow anyone to send you friend requests',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  value: _allowFriendRequests,
                  onChanged: (v) => setState(() => _allowFriendRequests = v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
