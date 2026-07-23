import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../constants/theme.dart';
import '../hooks/use_auth.dart';

class TierGate extends ConsumerWidget {
  final Widget freeWidget;
  final Widget? basicWidget;
  final Widget? mediumWidget;
  final Widget? premiumWidget;
  final List<String> allowedTiers;

  const TierGate({
    super.key,
    required this.freeWidget,
    this.basicWidget,
    this.mediumWidget,
    this.premiumWidget,
    this.allowedTiers = const ['free', 'basic', 'medium', 'premium'],
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final tier = user?.tier ?? 'free';

    if (!allowedTiers.contains(tier)) {
      return _UpgradePrompt(tier: tier);
    }

    switch (tier) {
      case 'premium':
        return premiumWidget ?? mediumWidget ?? basicWidget ?? freeWidget;
      case 'medium':
        return mediumWidget ?? basicWidget ?? freeWidget;
      case 'basic':
        return basicWidget ?? freeWidget;
      default:
        return freeWidget;
    }
  }
}

class _UpgradePrompt extends StatelessWidget {
  final String tier;

  const _UpgradePrompt({required this.tier});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline, size: 48, color: colors.fgMuted),
            const SizedBox(height: 16),
            Text(
              'Upgrade to access this feature',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Your current tier ($tier) does not have access.',
              style: TextStyle(color: colors.fgMuted),
            ),
          ],
        ),
      ),
    );
  }
}
