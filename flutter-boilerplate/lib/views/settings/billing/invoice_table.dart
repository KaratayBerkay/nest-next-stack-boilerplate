import 'package:flutter/material.dart' hide Badge;

import '../../../constants/theme.dart';
import '../../../components/ui/badge/badge.dart';

class InvoiceTable extends StatelessWidget {
  final List<Map<String, dynamic>> invoices;

  const InvoiceTable({
    super.key,
    required this.invoices,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (invoices.isEmpty) {
      return Text('No invoices yet.', style: TextStyle(color: colors.fgMuted));
    }

    return Column(
      children: invoices.map((inv) => ListTile(
        leading: Icon(Icons.receipt, color: colors.fgMuted),
        title: Text('\$${inv['amount']} ${(inv['currency'] as String).toUpperCase()}'),
        subtitle: Text(
          (inv['createdAt'] as DateTime).toLocal().toString().split(' ')[0],
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        trailing: Badge(
          text: inv['status'] as String,
          variant: inv['status'] == 'paid' ? BadgeVariant.success : BadgeVariant.warning,
        ),
        onTap: inv['pdfUrl'] != null ? () {} : null,
      )).toList(),
    );
  }
}
