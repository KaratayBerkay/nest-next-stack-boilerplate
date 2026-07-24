import 'package:flutter/material.dart';

class UnauthorizedPage extends StatelessWidget {
  final String message;
  final String label;
  final VoidCallback? onSignIn;

  const UnauthorizedPage({
    super.key,
    this.message = 'Sign in to access this page',
    this.label = 'Sign in',
    this.onSignIn,
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
              message,
              style: TextStyle(
                color: colors.onSurface.withValues(alpha: 0.6),
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: onSignIn,
              child: Text(label),
            ),
          ],
        ),
      ),
    );
  }
}
