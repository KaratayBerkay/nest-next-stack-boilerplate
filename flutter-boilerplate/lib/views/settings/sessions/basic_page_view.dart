import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/sessions/actions.dart';
import '../../../api/client/sessions/query.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';

class BasicSettingsSessionsPage extends ConsumerWidget {
  final String lang;

  const BasicSettingsSessionsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final sessionsAsync = ref.watch(sessionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sessions')),
      body: sessionsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (sessions) => ListView(
          padding: const EdgeInsets.all(16),
          children: sessions.map((s) => Padding(
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
                    ? Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: colors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text('Current',
                            style: TextStyle(fontSize: 11, color: colors.success),),
                      )
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
          ),).toList(),
        ),
      ),
    );
  }
}
