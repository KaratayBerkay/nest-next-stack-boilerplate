import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class BreadcrumbWidget extends StatelessWidget {
  final List<BreadcrumbItem> items;

  const BreadcrumbWidget({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Row(
      children: List.generate(items.length, (i) {
        final item = items[i];
        final isLast = i == items.length - 1;

        return Row(
          children: [
            InkWell(
              onTap: isLast ? null : item.onTap,
              child: Text(
                item.label,
                style: TextStyle(
                  fontSize: 13,
                  color: isLast ? colors.fg : colors.fgMuted,
                  fontWeight: isLast ? FontWeight.w500 : FontWeight.normal,
                ),
              ),
            ),
            if (!isLast) ...[
              const SizedBox(width: 8),
              Icon(Icons.chevron_right, size: 14, color: colors.fgMuted),
              const SizedBox(width: 8),
            ],
          ],
        );
      }),
    );
  }
}

class BreadcrumbItem {
  final String label;
  final VoidCallback? onTap;

  const BreadcrumbItem({required this.label, this.onTap});
}
