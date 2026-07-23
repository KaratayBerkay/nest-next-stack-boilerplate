import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/sessions/query.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class FreeSettingsSessionsPage extends ConsumerWidget {
  final String lang;

  const FreeSettingsSessionsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final sessionsAsync = ref.watch(sessionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sessions')),
      body: sessionsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (sessions) {
          final current = sessions.where((s) => s.isCurrent).toList();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ...current.map((s) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Card(
                  child: ListTile(
                    leading: Icon(Icons.devices, color: colors.brand),
                    title: Text(s.device),
                    subtitle: Text('${s.location} · Current session',
                        style: TextStyle(color: colors.fgMuted, fontSize: 12),),
                  ),
                ),
              ),),
              if (current.isEmpty)
                const Center(child: Text('No active sessions')),
              const SizedBox(height: 24),
              Center(
                child: Column(
                  children: [
                    Icon(Icons.lock_outline, size: 40, color: colors.fgMuted),
                    const SizedBox(height: 12),
                    Text('Upgrade to manage all sessions',
                        style: TextStyle(color: colors.fgMuted),),
                    const SizedBox(height: 12),
                    Button(
                      child: const Text('Upgrade'),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
