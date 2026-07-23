import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class SettingsRow extends StatelessWidget {
  final String label;
  final String? description;
  final Widget trailing;
  final VoidCallback? onTap;
  final bool showDivider;

  const SettingsRow({
    super.key,
    required this.label,
    this.description,
    required this.trailing,
    this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    final content = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: typography.body),
                if (description != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      description!,
                      style: typography.bodySmall.copyWith(color: colors.fgMuted),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          trailing,
        ],
      ),
    );

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (onTap != null)
          InkWell(onTap: onTap, child: content)
        else
          content,
        if (showDivider)
          Padding(
            padding: const EdgeInsets.only(left: 16),
            child: Divider(height: 1, color: colors.border),
          ),
      ],
    );
  }
}
