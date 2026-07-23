import 'package:flutter/material.dart' hide Badge;

import '../../../constants/theme.dart';
import '../../../components/ui/badge/badge.dart';

class PlanDetails extends StatelessWidget {
  final String planName;
  final String status;
  final String? price;
  final String? renewalDate;
  final bool cancelAtPeriodEnd;

  const PlanDetails({
    super.key,
    required this.planName,
    required this.status,
    this.price,
    this.renewalDate,
    this.cancelAtPeriodEnd = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(planName.toUpperCase(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            Badge(
              text: status == 'active' ? 'Active' : status,
              variant: status == 'active' ? BadgeVariant.success : BadgeVariant.warning,
            ),
          ],
        ),
        if (price != null) ...[
          const SizedBox(height: 4),
          Text(price!, style: const TextStyle(fontSize: 14)),
        ],
        if (renewalDate != null) ...[
          const SizedBox(height: 8),
          Text('Renewal date: $renewalDate',
              style: TextStyle(color: colors.fgMuted, fontSize: 13)),
        ],
        if (cancelAtPeriodEnd)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text('Cancels at period end', style: TextStyle(color: colors.warning, fontSize: 13)),
          ),
      ],
    );
  }
}
