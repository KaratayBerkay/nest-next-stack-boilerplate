import 'package:flutter/material.dart';

class ErrorPage extends StatelessWidget {
  final String message;
  final String? digest;
  final VoidCallback? onRetry;

  const ErrorPage({
    super.key,
    this.message = 'Something went wrong',
    this.digest,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Something went wrong',
              style: TextStyle(color: colors.error, fontSize: 13),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: TextStyle(
                color: colors.onSurface.withValues(alpha: 0.6),
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
            if (digest != null) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Reference: ',
                    style: TextStyle(
                      color: colors.onSurface.withValues(alpha: 0.5),
                      fontSize: 11,
                    ),
                  ),
                  Text(
                    digest!,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      color: colors.onSurface,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: onRetry,
                child: const Text('Try again', style: TextStyle(fontSize: 12)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
