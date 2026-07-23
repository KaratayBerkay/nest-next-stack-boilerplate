import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class BillingSummary extends StatelessWidget {
  final String plan;
  final String nextBilling;
  final String amount;
  final String? status;

  const BillingSummary({
    super.key,
    required this.plan,
    required this.nextBilling,
    required this.amount,
    this.status,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Billing Summary', style: TextStyle(fontWeight: FontWeight.w600)),
                if (status != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: status == 'active' ? colors.success.withValues(alpha: 0.1) : colors.warning.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      status!.toUpperCase(),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: status == 'active' ? colors.success : colors.warning,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            _BillingRow(label: 'Current Plan', value: plan),
            _BillingRow(label: 'Next Billing', value: nextBilling),
            const Divider(height: 20),
            _BillingRow(label: 'Amount', value: amount, bold: true),
          ],
        ),
      ),
    );
  }
}

class _BillingRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;

  const _BillingRow({required this.label, required this.value, this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value, style: TextStyle(fontWeight: bold ? FontWeight.w700 : FontWeight.w600)),
        ],
      ),
    );
  }
}
