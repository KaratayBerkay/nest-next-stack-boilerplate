import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/api_keys/actions.dart';
import '../../../api/client/api_keys/query.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';

class SettingsApiKeysPageContent extends ConsumerWidget {
  final String lang;

  const SettingsApiKeysPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final keysAsync = ref.watch(apiKeysProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('API Keys'),
        actions: [
          TextButton(
            onPressed: () => _showCreateDialog(context, ref),
            child: const Text('Create'),
          ),
        ],
      ),
      body: keysAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (keys) {
          if (keys.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('No API keys yet.', style: TextStyle(color: colors.fgMuted)),
                  const SizedBox(height: 16),
                  Button(
                    child: const Text('Create Key'),
                    onPressed: () => _showCreateDialog(context, ref),
                  ),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: keys.map((k) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(k.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                Text('${k.prefix}••••••••••••••••',
                                    style: TextStyle(color: colors.fgMuted, fontSize: 12),),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18),
                            onPressed: () async {
                              try {
                                await ref.read(apiKeyActionsProvider).revoke(k.id);
                                ref.invalidate(apiKeysProvider);
                                if (context.mounted) showToast(context, 'Key revoked');
                              } catch (e) {
                                if (context.mounted) showToast(context, 'Failed: $e');
                              }
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Created: ${k.createdAt.toLocal().toString().split(' ')[0]}',
                          style: TextStyle(color: colors.fgMuted, fontSize: 11),),
                      if (k.lastUsedAt != null)
                        Text('Last used: ${k.lastUsedAt!.toLocal().toString().split(' ')[0]}',
                            style: TextStyle(color: colors.fgMuted, fontSize: 11),),
                    ],
                  ),
                ),
              ),
            ),).toList(),
          );
        },
      ),
    );
  }

  void _showCreateDialog(BuildContext context, WidgetRef ref) {
    final ctrl = TextEditingController();
    showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create API Key'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(labelText: 'Key Name'),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ref.read(apiKeyActionsProvider).create(ctrl.text);
                ref.invalidate(apiKeysProvider);
                if (context.mounted) showToast(context, 'Key created');
              } catch (e) {
                if (context.mounted) showToast(context, 'Failed: $e');
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}
