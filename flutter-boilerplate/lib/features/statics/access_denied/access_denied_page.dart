import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../constants/theme.dart';

class AccessDeniedPage extends StatelessWidget {
  final String? requiredTier;
  final String? currentTier;

  const AccessDeniedPage({super.key, this.requiredTier, this.currentTier});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock_outline, size: 64, color: colors.fgMuted),
              const SizedBox(height: 16),
              Text(
                'Access Denied',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                requiredTier != null
                    ? 'This feature requires $requiredTier tier or above.'
                    : 'You do not have permission to access this page.',
                textAlign: TextAlign.center,
                style: TextStyle(color: colors.fgMuted),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.go('/v1/en/plans'),
                child: const Text('Upgrade'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
