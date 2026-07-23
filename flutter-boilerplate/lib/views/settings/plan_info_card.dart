import 'package:flutter/material.dart' hide Badge;

import '../../constants/theme.dart';
import '../../components/ui/badge/badge.dart';
import '../../components/ui/card/card.dart';
import '../../components/ui/card/card_content.dart';
import '../../components/ui/card/card_header.dart';

class PlanInfoCard extends StatelessWidget {
  final String planName;
  final String status;
  final String? renewalDate;
  final bool cancelAtPeriodEnd;
  final String? price;

  const PlanInfoCard({
    super.key,
    required this.planName,
    required this.status,
    this.renewalDate,
    this.cancelAtPeriodEnd = false,
    this.price,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CardHeader(child: Text('Current Plan', style: TextStyle(fontWeight: FontWeight.w600))),
          CardContent(
            child: Column(
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
              ],
            ),
          ),
        ],
      ),
    );
  }
}
