import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../components/ui/button/button.dart';

class UpgradeActions extends StatelessWidget {
  final String lang;
  final bool isOnPaidPlan;
  final VoidCallback? onCancel;

  const UpgradeActions({
    super.key,
    required this.lang,
    this.isOnPaidPlan = false,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!isOnPaidPlan)
          Button(
            fullWidth: true,
            child: const Text('Upgrade Plan'),
            onPressed: () => context.go('/v1/$lang/plans'),
          ),
        if (isOnPaidPlan) ...[
          Button(
            fullWidth: true,
            variant: ButtonVariant.outline,
            child: const Text('Change Plan'),
            onPressed: () => context.go('/v1/$lang/plans'),
          ),
          const SizedBox(height: 8),
          Button(
            fullWidth: true,
            variant: ButtonVariant.danger,
            child: const Text('Cancel Subscription'),
            onPressed: onCancel,
          ),
        ],
      ],
    );
  }
}
