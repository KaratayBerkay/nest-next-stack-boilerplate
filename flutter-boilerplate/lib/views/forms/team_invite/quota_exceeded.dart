import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class QuotaExceeded extends StatelessWidget {
  final int currentCount;
  final int maxAllowed;
  final String? planName;
  final VoidCallback? onUpgrade;

  const QuotaExceeded({
    super.key,
    required this.currentCount,
    required this.maxAllowed,
    this.planName,
    this.onUpgrade,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.warning.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.warning.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.warning_amber_rounded,
                color: colors.warning,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Invite Limit Reached',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: colors.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Your ${planName ?? 'current'} plan allows up to $maxAllowed invites. You already have $currentCount members.',
            style: TextStyle(color: colors.fgMuted, fontSize: 13),
          ),
          if (onUpgrade != null) ...[
            const SizedBox(height: 12),
            Button(
              size: ButtonSize.sm,
              onPressed: onUpgrade,
              child: const Text('Upgrade Plan'),
            ),
          ],
        ],
      ),
    );
  }
}
