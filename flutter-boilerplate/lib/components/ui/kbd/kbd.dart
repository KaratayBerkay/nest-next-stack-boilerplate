import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class KbdWidget extends StatelessWidget {
  final String label;

  const KbdWidget({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: colors.surfaceAlt,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: colors.border),
        boxShadow: [
          BoxShadow(
            color: colors.border,
            offset: const Offset(0, 1),
            blurRadius: 0,
          ),
        ],
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: colors.fgMuted,
        ),
      ),
    );
  }
}
