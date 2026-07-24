import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class CouponStatus extends StatelessWidget {
  final String? code;
  final double? discountPercent;
  final VoidCallback? onRemove;

  const CouponStatus({
    super.key,
    this.code,
    this.discountPercent,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (code == null) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colors.success.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: colors.success.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.discount, size: 16, color: colors.success),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  code!,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: colors.success,
                  ),
                ),
                if (discountPercent != null)
                  Text(
                    '${discountPercent!.toInt()}% off',
                    style: TextStyle(fontSize: 12, color: colors.success),
                  ),
              ],
            ),
          ),
          if (onRemove != null)
            IconButton(
              icon: Icon(Icons.close, size: 16, color: colors.fgMuted),
              onPressed: onRemove,
              visualDensity: VisualDensity.compact,
            ),
        ],
      ),
    );
  }
}
