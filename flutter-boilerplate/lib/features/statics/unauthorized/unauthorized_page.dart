import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class UnauthorizedPage extends StatelessWidget {
  const UnauthorizedPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.person_off_outlined, size: 64, color: theme.colorScheme.error),
              const SizedBox(height: 16),
              Text(
                'Sign in required',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Please sign in to access this page.',
                textAlign: TextAlign.center,
                style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.go('/auth/login'),
                child: const Text('Sign In'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
