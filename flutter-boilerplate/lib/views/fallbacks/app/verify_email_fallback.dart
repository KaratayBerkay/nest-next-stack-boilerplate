import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class VerifyEmailFallbackScreen extends StatelessWidget {
  final String? error;
  final VoidCallback? onRetry;

  const VerifyEmailFallbackScreen({super.key, this.error, this.onRetry});

  @override
  Widget build(BuildContext context) {
    if (error != null) {
      return _VerifyErrorFallback(error: error!, onRetry: onRetry);
    }
    return _VerifyLoadingFallback();
  }
}

class _VerifyLoadingFallback extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.email_outlined, size: 72, color: colors.fgMuted),
            const SizedBox(height: 20),
            Shimmer.fromColors(
              baseColor: colors.surfaceHover,
              highlightColor: colors.surfaceAlt,
              child: Container(
                width: 160,
                height: 22,
                decoration: BoxDecoration(
                  color: colors.surfaceHover,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Shimmer.fromColors(
              baseColor: colors.surfaceHover,
              highlightColor: colors.surfaceAlt,
              child: Container(
                width: 280,
                height: 14,
                decoration: BoxDecoration(
                  color: colors.surfaceHover,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Shimmer.fromColors(
              baseColor: colors.surfaceHover,
              highlightColor: colors.surfaceHover,
              child: Container(
                width: 200,
                height: 44,
                decoration: BoxDecoration(
                  color: colors.surfaceHover,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VerifyErrorFallback extends StatelessWidget {
  final String error;
  final VoidCallback? onRetry;

  const _VerifyErrorFallback({required this.error, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.warning_amber_rounded, size: 64, color: colors.warning),
            const SizedBox(height: 20),
            Text(
              t.errorSomethingWentWrong,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              error,
              style: TextStyle(color: colors.fgMuted, fontSize: 15),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 18),
                label: Text(t.errorTryAgain),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
