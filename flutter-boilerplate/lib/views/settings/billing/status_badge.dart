import 'package:flutter/material.dart' hide Badge;

import '../../../components/ui/badge/badge.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    final (String label, BadgeVariant variant) = switch (status.toLowerCase()) {
      'active' => ('Active', BadgeVariant.success),
      'inactive' => ('Inactive', BadgeVariant.secondary),
      'pending' => ('Pending', BadgeVariant.warning),
      'canceled' || 'cancelled' => ('Canceled', BadgeVariant.danger),
      'expired' => ('Expired', BadgeVariant.danger),
      'past_due' => ('Past Due', BadgeVariant.warning),
      'trialing' => ('Trialing', BadgeVariant.info),
      _ => (status, BadgeVariant.secondary),
    };

    return Badge(text: label, variant: variant);
  }
}
