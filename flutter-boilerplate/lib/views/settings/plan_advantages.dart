import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class PlanAdvantages extends StatelessWidget {
  final List<String> advantages;
  final Color? iconColor;

  const PlanAdvantages({
    super.key,
    required this.advantages,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: advantages.map((advantage) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.check_circle, size: 18, color: iconColor ?? colors.success),
            const SizedBox(width: 8),
            Expanded(
              child: Text(advantage, style: const TextStyle(fontSize: 14)),
            ),
          ],
        ),
      ),).toList(),
    );
  }
}
