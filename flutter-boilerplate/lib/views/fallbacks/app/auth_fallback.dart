import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class AuthFallbackScreen extends StatelessWidget {
  final String? error;
  final VoidCallback? onRetry;

  const AuthFallbackScreen({super.key, this.error, this.onRetry});

  @override
  Widget build(BuildContext context) {
    if (error != null) {
      return _AuthErrorFallback(error: error!, onRetry: onRetry);
    }
    return _AuthLoadingFallback();
  }
}

class _AuthLoadingFallback extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Shimmer.fromColors(
              baseColor: colors.surfaceHover,
              highlightColor: colors.surfaceAlt,
              child: CircleAvatar(
                radius: 32,
                backgroundColor: colors.surfaceHover,
              ),
            ),
            const SizedBox(height: 24),
            Shimmer.fromColors(
              baseColor: colors.surfaceHover,
              highlightColor: colors.surfaceAlt,
              child: Container(
                width: 180,
                height: 20,
                decoration: BoxDecoration(
                  color: colors.surfaceHover,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Shimmer.fromColors(
              baseColor: colors.surfaceHover,
              highlightColor: colors.surfaceAlt,
              child: Container(
                width: double.infinity,
                height: 48,
                decoration: BoxDecoration(
                  color: colors.surfaceHover,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Shimmer.fromColors(
              baseColor: colors.surfaceHover,
              highlightColor: colors.surfaceAlt,
              child: Container(
                width: double.infinity,
                height: 48,
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

class _AuthErrorFallback extends StatelessWidget {
  final String error;
  final VoidCallback? onRetry;

  const _AuthErrorFallback({
    required this.error,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 64, color: colors.danger),
            const SizedBox(height: 20),
            Text(
              'Something went wrong',
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
                label: const Text('Try Again'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
