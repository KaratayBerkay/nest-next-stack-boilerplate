import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class BadgeWidget extends StatelessWidget {
  final int count;
  final Color? color;

  const BadgeWidget({super.key, required this.count, this.color});

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color ?? colors.danger,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        count > 99 ? '99+' : '$count',
        style: TextStyle(
          color: colors.surface,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
