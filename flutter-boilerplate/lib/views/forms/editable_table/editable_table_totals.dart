import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class EditableTableTotals extends StatelessWidget {
  final double subtotal;
  final double? tax;
  final double? taxRate;
  final double? discount;

  const EditableTableTotals({
    super.key,
    required this.subtotal,
    this.tax,
    this.taxRate,
    this.discount,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final calculatedTax = tax ?? (taxRate != null ? subtotal * taxRate! : 0);
    final discountedAmount = discount != null ? subtotal * discount! : 0;
    final total = subtotal + calculatedTax - discountedAmount;

    return Column(
      children: [
        if (discount != null && discount! > 0)
          _TotalRow(label: 'Discount', value: '- \$${discountedAmount.toStringAsFixed(2)}', color: colors.success),
        if (calculatedTax > 0)
          _TotalRow(label: 'Tax', value: '\$${calculatedTax.toStringAsFixed(2)}', color: colors.fgMuted),
        const Divider(height: 20),
        _TotalRow(label: 'Total', value: '\$${total.toStringAsFixed(2)}', bold: true, color: colors.fg),
      ],
    );
  }
}

class _TotalRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color color;

  const _TotalRow({
    required this.label,
    required this.value,
    this.bold = false,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(label, style: TextStyle(color: color)),
          const SizedBox(width: 12),
          Text(value, style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}
