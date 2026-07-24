import 'package:flutter/material.dart' hide Badge;

import '../../../components/ui/badge/badge.dart';
import '../../../constants/theme.dart';

class NoncePanel extends StatelessWidget {
  final String nonce;
  final String? source;
  final bool isValid;

  const NoncePanel({
    super.key,
    required this.nonce,
    this.source,
    this.isValid = true,
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
              children: [
                Icon(
                  Icons.security,
                  size: 20,
                  color: isValid ? colors.success : colors.danger,
                ),
                const SizedBox(width: 8),
                const Text(
                  'CSP Nonce',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Badge(
                  text: isValid ? 'Valid' : 'Invalid',
                  variant: isValid ? BadgeVariant.success : BadgeVariant.danger,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: colors.surfaceAlt,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: colors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Nonce Value',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: colors.fgMuted,
                    ),
                  ),
                  const SizedBox(height: 4),
                  SelectableText(
                    nonce,
                    style: TextStyle(
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: colors.fg,
                    ),
                  ),
                ],
              ),
            ),
            if (source != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    'Source: ',
                    style: TextStyle(fontSize: 12, color: colors.fgMuted),
                  ),
                  Text(
                    source!,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: colors.fg,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.check_circle, size: 14, color: colors.success),
                const SizedBox(width: 6),
                Text(
                  'Applied to script and style tags',
                  style: TextStyle(fontSize: 11, color: colors.fgMuted),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
