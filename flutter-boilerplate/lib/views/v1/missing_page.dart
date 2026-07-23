import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MissingPage extends StatelessWidget {
  final String lang;

  const MissingPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '404',
              style: theme.textTheme.displayLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'This resource could not be found.',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => context.go('/v1/$lang'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    );
  }
}
