import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class GlobalErrorPage extends StatelessWidget {
  final String? message;
  final String? digest;
  final VoidCallback? onRetry;

  const GlobalErrorPage({
    super.key,
    this.message,
    this.digest,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Material(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                t.errorSomethingWentWrong,
                style: TextStyle(
                  color: colors.danger,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                message ?? t.errorSomethingWentWrong,
                style: TextStyle(color: colors.fgMuted, fontSize: 14),
                textAlign: TextAlign.center,
              ),
              if (digest != null) ...[
                const SizedBox(height: 8),
                Text(
                  '${t.errorReference} $digest',
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
              ],
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                TextButton(
                  onPressed: onRetry,
                  child: Text(t.errorTryAgain),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
