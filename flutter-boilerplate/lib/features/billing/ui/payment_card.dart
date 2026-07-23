import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/card/card.dart';

class PaymentCard extends StatelessWidget {
  final String brand;
  final String last4;
  final int expiryMonth;
  final int expiryYear;
  final bool isDefault;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;

  const PaymentCard({
    super.key,
    required this.brand,
    required this.last4,
    required this.expiryMonth,
    required this.expiryYear,
    this.isDefault = false,
    this.onTap,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return CardWidget(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 32,
            decoration: BoxDecoration(
              color: colors.surfaceHover,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: colors.border),
            ),
            child: Icon(_cardIcon, size: 20, color: colors.fg),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(brand, style: typography.label),
                    if (isDefault)
                      Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: colors.brand.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Default',
                            style: typography.caption.copyWith(color: colors.brand, fontSize: 10),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '•••• $last4',
                  style: typography.body.copyWith(color: colors.fgMuted),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$expiryMonth/${expiryYear.toString().padLeft(2, '0')}',
                style: typography.caption.copyWith(color: colors.fgMuted),
              ),
              if (onDelete != null) ...[
                const SizedBox(height: 8),
                InkWell(
                  onTap: onDelete,
                  borderRadius: BorderRadius.circular(4),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Icon(Icons.delete_outline, size: 16, color: colors.danger),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  IconData get _cardIcon {
    final lower = brand.toLowerCase();
    if (lower.contains('visa')) return Icons.credit_card_rounded;
    if (lower.contains('master')) return Icons.credit_card_rounded;
    if (lower.contains('amex')) return Icons.credit_card_rounded;
    return Icons.credit_card_outlined;
  }
}
