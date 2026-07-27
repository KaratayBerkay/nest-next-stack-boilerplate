import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/api_keys/actions.dart';
import '../../../api/client/api_keys/query.dart';
import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../../../fallbacks/index.dart';
import '../settings_shell.dart';

const _expiryPresets = <int?>[
  null,
  7,
  30,
  90,
  365,
];

class SettingsApiKeysPageContent extends ConsumerWidget {
  final String lang;

  const SettingsApiKeysPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final keysAsync = ref.watch(apiKeysProvider);

    return SettingsShellScaffold(
      lang: lang,
      child: Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              Text(
                t.settingsApiKeysHeading,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              TextButton(
                onPressed: () => _showCreateDialog(context, ref),
                child: Text(t.settingsApiKeysCreate),
              ),
            ],
          ),
        ),
        Expanded(
          child: keysAsync.when(
            loading: () => const Center(child: SettingsLoadingFallback()),
            error: (e, _) => Center(child: Text('Error: $e')),
            data: (keys) {
              if (keys.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'No API keys yet.',
                        style: TextStyle(color: colors.fgMuted),
                      ),
                      const SizedBox(height: 16),
                      Button(
                        child: Text(t.settingsApiKeysCreate),
                        onPressed: () => _showCreateDialog(context, ref),
                      ),
                    ],
                  ),
                );
              }
              return ListView(
                padding: const EdgeInsets.all(16),
                children: keys
                    .map(
                      (k) => Padding(
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
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Text(
                                                k.name,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Badge(
                                                text: k.enabled ? 'Active' : 'Disabled',
                                                variant: k.enabled
                                                    ? BadgeVariant.success
                                                    : BadgeVariant.warning,
                                              ),
                                            ],
                                          ),
                                          Text(
                                            '${k.prefix}••••••••••••••••',
                                            style: TextStyle(
                                              color: colors.fgMuted,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(
                                        Icons.delete_outline,
                                        size: 18,
                                      ),
                                      onPressed: () async {
                                        try {
                                          await ref
                                              .read(apiKeyActionsProvider)
                                              .revoke(k.id);
                                          ref.invalidate(apiKeysProvider);
                                          if (context.mounted) {
                                            showToast(context, 'Key revoked');
                                          }
                                        } catch (e) {
                                          if (context.mounted) {
                                            showToast(context, 'Failed: $e');
                                          }
                                        }
                                      },
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Created: ${k.createdAt.toLocal().toString().split(' ')[0]}',
                                  style: TextStyle(
                                    color: colors.fgMuted,
                                    fontSize: 11,
                                  ),
                                ),
                                Text(
                                  k.expiresAt != null
                                      ? 'Expires: ${k.expiresAt!.toLocal().toString().split(' ')[0]}'
                                      : 'No expiry',
                                  style: TextStyle(
                                    color: colors.fgMuted,
                                    fontSize: 11,
                                  ),
                                ),
                                if (k.lastUsedAt != null)
                                  Text(
                                    'Last used: ${k.lastUsedAt!.toLocal().toString().split(' ')[0]}',
                                    style: TextStyle(
                                      color: colors.fgMuted,
                                      fontSize: 11,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
          ),
        ),
      ],
      ),
    );
  }

  void _showCreateDialog(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final nameCtrl = TextEditingController();
    int? selectedExpiry;

    showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: Text(t.settingsApiKeysCreateHeading),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: InputDecoration(
                  labelText: t.settingsApiKeysNameLabel,
                ),
                autofocus: true,
              ),
              const SizedBox(height: 16),
              const Text('Expiry',
                  style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _expiryPresets.map((days) {
                  final label = days == null ? 'No expiry' : '$days days';
                  final selected = selectedExpiry == days;
                  return ChoiceChip(
                    label: Text(label, style: const TextStyle(fontSize: 12)),
                    selected: selected,
                    onSelected: (_) {
                      setDialogState(() => selectedExpiry = days);
                    },
                  );
                }).toList(),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(t.settingsCancelButton),
            ),
            FilledButton(
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  final result = await ref
                      .read(apiKeyActionsProvider)
                      .create(nameCtrl.text, expiresInDays: selectedExpiry);
                  ref.invalidate(apiKeysProvider);
                  if (context.mounted) {
                    _showKeyDialog(context, result);
                  }
                } catch (e) {
                  if (context.mounted) showToast(context, 'Failed: $e');
                }
              },
              child: Text(t.settingsApiKeysCreate),
            ),
          ],
        ),
      ),
    );
  }

  void _showKeyDialog(BuildContext context, Map<String, dynamic> result) {
    final fullKey = result['fullKey'] as String?;
    if (fullKey == null) return;
    final t = AppLocalizations.of(context);

    showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('API Key Created'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Make sure to copy your API key now. You won\'t be able to see it again.',
              style: TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: SelectableText(
                fullKey,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
            },
            child: Text(t.v1ShellClose),
          ),
        ],
      ),
    );
  }
}
