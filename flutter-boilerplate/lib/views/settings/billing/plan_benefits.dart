import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class PlanBenefits extends StatelessWidget {
  final List<String> benefits;
  final Color? iconColor;

  const PlanBenefits({
    super.key,
    required this.benefits,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: benefits
          .map(
            (benefit) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 18,
                    color: iconColor ?? colors.success,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(benefit, style: const TextStyle(fontSize: 14)),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}
