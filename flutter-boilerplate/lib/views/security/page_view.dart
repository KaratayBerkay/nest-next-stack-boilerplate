import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';

class SecurityPageContent extends ConsumerWidget {
  final String lang;

  const SecurityPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Security')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Two-Factor Authentication'),
                  subtitle: Text('Add an extra layer of security',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12),),
                  value: false,
                  onChanged: (_) {},
                ),
                const Divider(height: 1),
                ListTile(
                  title: const Text('Change Password'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  title: const Text('Active Sessions'),
                  subtitle: Text('Manage your logged-in devices',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12),),
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
