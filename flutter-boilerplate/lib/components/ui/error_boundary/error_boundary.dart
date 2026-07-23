import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class ErrorBoundary extends StatelessWidget {
  final Object? error;
  final Widget child;
  final Widget Function(Object error, VoidCallback onRetry)? fallbackBuilder;
  final VoidCallback? onRetry;

  const ErrorBoundary({
    super.key,
    this.error,
    required this.child,
    this.fallbackBuilder,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    if (error != null) {
      return fallbackBuilder?.call(error!, _retry) ?? _defaultFallback(context);
    }
    return child;
  }

  void _retry() => onRetry?.call();

  Widget _defaultFallback(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 40, color: colors.danger),
            const SizedBox(height: 12),
            Text(
              'Something went wrong',
              style: TextStyle(
                color: colors.fg,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (error != null) ...[
              const SizedBox(height: 4),
              Text(
                error.toString(),
                style: TextStyle(
                  fontSize: 12,
                  color: colors.fgMuted,
                ),
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 16),
            FilledButton.tonal(
              onPressed: _retry,
              child: const Text('Try again'),
            ),
          ],
        ),
      ),
    );
  }
}
