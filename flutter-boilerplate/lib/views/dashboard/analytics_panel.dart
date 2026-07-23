import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class AnalyticsPanel extends StatelessWidget {
  const AnalyticsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Analytics',
            style: TextStyle(
              color: colors.brand,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Rendered by the analytics slot.',
            style: TextStyle(color: colors.fgMuted, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
