import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/theme.dart';

class SettingsPrivacyPageContent extends ConsumerWidget {
  final String lang;

  const SettingsPrivacyPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: _PrivacySettings(),
      basicWidget: _PrivacySettings(),
      mediumWidget: _PrivacySettings(),
      premiumWidget: _PrivacySettings(),
    );
  }
}

class _PrivacySettings extends StatefulWidget {
  @override
  State<_PrivacySettings> createState() => _PrivacySettingsState();
}

class _PrivacySettingsState extends State<_PrivacySettings> {
  bool _showOnlineStatus = true;
  bool _showReadReceipts = true;
  bool _allowFriendRequests = true;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Privacy')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Online Status'),
                  subtitle: Text('Show when you\'re online',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12),),
                  value: _showOnlineStatus,
                  onChanged: (v) => setState(() => _showOnlineStatus = v),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Read Receipts'),
                  subtitle: Text('Let others know you\'ve read their messages',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12),),
                  value: _showReadReceipts,
                  onChanged: (v) => setState(() => _showReadReceipts = v),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Friend Requests'),
                  subtitle: Text('Allow anyone to send you friend requests',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12),),
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
