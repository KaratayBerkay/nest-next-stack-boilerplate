import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class BasicSettingsPrivacyPage extends StatefulWidget {
  final String lang;

  const BasicSettingsPrivacyPage({super.key, required this.lang});

  @override
  State<BasicSettingsPrivacyPage> createState() => _BasicSettingsPrivacyPageState();
}

class _BasicSettingsPrivacyPageState extends State<BasicSettingsPrivacyPage> {
  bool _showOnlineStatus = true;
  bool _showReadReceipts = true;

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
                      style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                  value: _showOnlineStatus,
                  onChanged: (v) => setState(() => _showOnlineStatus = v),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Read Receipts'),
                  subtitle: Text('Let others know you\'ve read their messages',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                  value: _showReadReceipts,
                  onChanged: (v) => setState(() => _showReadReceipts = v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
