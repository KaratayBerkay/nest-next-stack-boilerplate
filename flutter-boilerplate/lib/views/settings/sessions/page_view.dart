import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/sessions/actions.dart';
import '../../../api/client/sessions/query.dart';
import '../../../api/server/sessions/list.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';
import '../../../l10n/app_localizations.dart';
import '../../../../fallbacks/index.dart';
import '../settings_shell.dart';
import 'empty_sessions.dart';

String _friendlyDeviceLabel(String? userAgent) {
  if (userAgent == null || userAgent.isEmpty) {
    return 'Unknown device';
  }
  String browser = 'Unknown';
  String os = 'Unknown';

  if (userAgent.contains('Chrome/')) { browser = 'Chrome'; }
  else if (userAgent.contains('Firefox/')) { browser = 'Firefox'; }
  else if (userAgent.contains('Safari/')) { browser = 'Safari'; }
  else if (userAgent.contains('Edg/')) { browser = 'Edge'; }

  if (userAgent.contains('Windows NT')) { os = 'Windows'; }
  else if (userAgent.contains('Mac OS X')) { os = 'macOS'; }
  else if (userAgent.contains('Linux')) { os = 'Linux'; }
  else if (userAgent.contains('Android')) { os = 'Android'; }
  else if (userAgent.contains('iPhone') || userAgent.contains('iPad')) { os = 'iOS'; }

  return '$browser on $os';
}

class SettingsSessionsPageContent extends ConsumerWidget {
  final String lang;

  const SettingsSessionsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final sessionsAsync = ref.watch(sessionsProvider);
    final user = ref.watch(currentUserProvider);

    return SettingsShellScaffold(
      lang: lang,
      child: Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              Text(
                t.settingsNavSessions,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              TextButton(
                onPressed: () async {
                  try {
                    await ref.read(sessionActionsProvider).revokeOthers();
                    ref.invalidate(sessionsProvider);
                    if (context.mounted) {
                      showToast(context, 'Other sessions revoked');
                    }
                  } catch (e) {
                    if (context.mounted) showToast(context, 'Failed: $e');
                  }
                },
                child: Text(t.settingsLogOutAllOtherSessions),
              ),
            ],
          ),
        ),
        Expanded(
          child: sessionsAsync.when(
            loading: () => const Center(child: SettingsLoadingFallback()),
            error: (e, _) => Center(child: Text('Error: $e')),
            data: (sessions) {
              if (sessions.isEmpty) {
                return const EmptySessions();
              }
              return ListView(
                padding: const EdgeInsets.all(16),
                children: sessions
                    .map(
                      (Session s) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Card(
                          child: ListTile(
                            leading: Icon(
                              s.id == user?.sessionId
                                  ? Icons.devices
                                  : Icons.device_unknown,
                              color: s.id == user?.sessionId
                                  ? colors.brand
                                  : colors.fgMuted,
                            ),
                            title: Text(_friendlyDeviceLabel(s.userAgent)),
                            subtitle: Text(
                              '${s.location} · ${s.lastActive}',
                              style:
                                  TextStyle(color: colors.fgMuted, fontSize: 12),
                            ),
                            trailing: s.id == user?.sessionId
                                ? Badge(
                                    label: Text(
                                      'Current',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: colors.surface,
                                      ),
                                    ),
                                    backgroundColor: colors.success,
                                  )
                                : TextButton(
                                    onPressed: () async {
                                      try {
                                        await ref
                                            .read(sessionActionsProvider)
                                            .revoke(s.id);
                                        ref.invalidate(sessionsProvider);
                                        if (context.mounted) {
                                          showToast(context, 'Session revoked');
                                        }
                                      } catch (e) {
                                        if (context.mounted) {
                                          showToast(
                                              context, 'Failed: $e');
                                        }
                                      }
                                    },
                                    child: const Text(
                                      'Revoke',
                                      style: TextStyle(fontSize: 12),
                                    ),
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
}
