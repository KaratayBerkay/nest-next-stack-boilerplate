import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/sessions/actions.dart';
import '../../../api/client/sessions/query.dart';
import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';

class PremiumSettingsSessionsPage extends ConsumerWidget {
  final String lang;

  const PremiumSettingsSessionsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final sessionsAsync = ref.watch(sessionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sessions'),
        actions: [
          TextButton(
            onPressed: () async {
              try {
                await ref.read(sessionActionsProvider).revokeOthers();
                ref.invalidate(sessionsProvider);
                if (context.mounted) showToast(context, 'Other sessions revoked');
              } catch (e) {
                if (context.mounted) showToast(context, 'Failed: $e');
              }
            },
            child: const Text('Revoke All'),
          ),
        ],
      ),
      body: sessionsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (sessions) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ...sessions.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Card(
                child: ListTile(
                  leading: Icon(
                    s.isCurrent ? Icons.devices : Icons.device_unknown,
                    color: s.isCurrent ? colors.brand : colors.fgMuted,
                  ),
                  title: Text(s.device),
                  subtitle: Text('${s.location} · ${s.lastActive}',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12),),
                  trailing: s.isCurrent
                      ? const Badge(text: 'Current', variant: BadgeVariant.success)
                      : TextButton(
                          onPressed: () async {
                            try {
                              await ref.read(sessionActionsProvider).revoke(s.id);
                              ref.invalidate(sessionsProvider);
                              if (context.mounted) showToast(context, 'Session revoked');
                            } catch (e) {
                              if (context.mounted) showToast(context, 'Failed: $e');
                            }
                          },
                          child: const Text('Revoke', style: TextStyle(fontSize: 12)),
                        ),
                ),
              ),
            ),),
          ],
        ),
      ),
    );
  }
}
