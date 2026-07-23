import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class PlanSummaryCard extends StatelessWidget {
  final String tierLabel;
  final String price;
  final List<String> features;

  const PlanSummaryCard({
    super.key,
    required this.tierLabel,
    required this.price,
    this.features = const [],
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            tierLabel,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 4),
          Text(
            price,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          if (features.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...features.map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Icon(Icons.check, size: 14, color: colors.success),
                      const SizedBox(width: 6),
                      Text(
                        f,
                        style: TextStyle(
                          fontSize: 13,
                          color: colors.fgMuted,
                        ),
                      ),
                    ],
                  ),
                ),),
          ],
        ],
      ),
    );
  }
}
