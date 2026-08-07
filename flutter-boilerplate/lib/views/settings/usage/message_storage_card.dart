import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/usage/query.dart';
import '../../../components/ui/card/card.dart';
import '../../../components/ui/label/label.dart';
import '../../../components/ui/progress/progress.dart';
import '../../../components/ui/spinner/spinner.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

String _formatBytes(int bytes) {
  if (bytes >= 1024 * 1024) {
    return '${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB';
  }
  if (bytes >= 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
  return '$bytes B';
}

class MessageStorageCard extends ConsumerWidget {
  const MessageStorageCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final usageAsync = ref.watch(messageUsageProvider);

    return usageAsync.when(
      loading: () => const CardWidget(
        variant: CardVariant.surface,
        child: SizedBox(height: 64, child: Center(child: Spinner())),
      ),
      error: (err, _) => CardWidget(
        variant: CardVariant.surface,
        child: Text('$err'),
      ),
      data: (data) {
        final percent = (data.bytes / data.limitBytes).clamp(0.0, 1.0);
        final overLimit = data.bytes >= data.limitBytes;

        return CardWidget(
          variant: CardVariant.surface,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Label(text: t.settingsUsageStored),
              const SizedBox(height: 6),
              RichText(
                text: TextSpan(
                  style: TextStyle(
                    color: colors.fg,
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                  ),
                  children: [
                    TextSpan(text: _formatBytes(data.bytes)),
                    TextSpan(
                      text:
                          '  ${t.settingsUsageOf} ${_formatBytes(data.limitBytes)}',
                      style: TextStyle(
                        color: colors.fgMuted,
                        fontSize: 13,
                        fontWeight: FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${data.letters} ${t.settingsUsageLetters} · '
                '${t.settingsUsageMonth}',
                style: TextStyle(color: colors.fgMuted, fontSize: 13),
              ),
              const SizedBox(height: 16),
              ProgressWidget(
                value: percent,
                color: overLimit ? colors.danger : null,
              ),
              if (overLimit) ...[
                const SizedBox(height: 12),
                Text(
                  t.settingsUsageLimitReached,
                  style: TextStyle(color: colors.danger, fontSize: 13),
                ),
              ],
              const SizedBox(height: 12),
              Text(
                t.settingsUsageUpgradeHint,
                style: TextStyle(color: colors.fgMuted, fontSize: 12),
              ),
            ],
          ),
        );
      },
    );
  }
}
