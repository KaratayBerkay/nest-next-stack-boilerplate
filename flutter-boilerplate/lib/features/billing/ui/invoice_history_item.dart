import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum InvoiceStatus { paid, pending, failed, cancelled }

class InvoiceHistoryItem extends StatelessWidget {
  final String date;
  final String amount;
  final InvoiceStatus status;
  final VoidCallback? onDownload;
  final VoidCallback? onTap;

  const InvoiceHistoryItem({
    super.key,
    required this.date,
    required this.amount,
    required this.status,
    this.onDownload,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Expanded(
              flex: 3,
              child: Text(date, style: typography.body),
            ),
            Expanded(
              flex: 2,
              child: Text(amount, style: typography.body),
            ),
            Expanded(
              flex: 2,
              child: _StatusBadge(status: status, colors: colors, typography: typography),
            ),
            if (onDownload != null)
              IconButton(
                icon: Icon(Icons.download_rounded, size: 18, color: colors.fgMuted),
                onPressed: onDownload,
                constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                padding: EdgeInsets.zero,
              ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final InvoiceStatus status;
  final AppColors colors;
  final AppTypography typography;

  const _StatusBadge({
    required this.status,
    required this.colors,
    required this.typography,
  });

  @override
  Widget build(BuildContext context) {
    final (Color bg, Color fg, String label) = switch (status) {
      InvoiceStatus.paid => (colors.success.withValues(alpha: 0.1), colors.success, 'Paid'),
      InvoiceStatus.pending => (colors.warning.withValues(alpha: 0.1), colors.warning, 'Pending'),
      InvoiceStatus.failed => (colors.danger.withValues(alpha: 0.1), colors.danger, 'Failed'),
      InvoiceStatus.cancelled => (colors.fgMuted.withValues(alpha: 0.1), colors.fgMuted, 'Cancelled'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: typography.caption.copyWith(color: fg, fontWeight: FontWeight.w600),
      ),
    );
  }
}
