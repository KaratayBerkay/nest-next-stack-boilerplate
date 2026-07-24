import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';

class SettingsPageContent extends StatelessWidget {
  final String lang;

  const SettingsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SettingsTile(
            icon: Icons.person_outline,
            title: 'Account',
            subtitle: 'Profile, avatar, name',
            onTap: () => context.go('/v1/$lang/settings/account'),
          ),
          _SettingsTile(
            icon: Icons.credit_card_outlined,
            title: 'Billing',
            subtitle: 'Payment methods, invoices, plan',
            onTap: () => context.go('/v1/$lang/settings/billing'),
          ),
          _SettingsTile(
            icon: Icons.settings_outlined,
            title: 'General',
            subtitle: 'Language, theme, preferences',
            onTap: () => context.go('/v1/$lang/settings/general'),
          ),
          _SettingsTile(
            icon: Icons.lock_outline,
            title: 'Privacy',
            subtitle: 'Privacy settings, data sharing',
            onTap: () => context.go('/v1/$lang/settings/privacy'),
          ),
          _SettingsTile(
            icon: Icons.devices_outlined,
            title: 'Sessions',
            subtitle: 'Active sessions, device management',
            onTap: () => context.go('/v1/$lang/settings/sessions'),
          ),
          _SettingsTile(
            icon: Icons.vpn_key_outlined,
            title: 'API Keys',
            subtitle: 'Manage API keys',
            onTap: () => context.go('/v1/$lang/settings/api-keys'),
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: colors.brand),
        title: Text(title),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        trailing: Icon(Icons.chevron_right, color: colors.fgMuted),
        onTap: onTap,
      ),
    );
  }
}
