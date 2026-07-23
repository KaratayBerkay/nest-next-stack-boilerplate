import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class PageHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? action;
  final EdgeInsetsGeometry padding;

  const PageHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.action,
    this.padding = const EdgeInsets.fromLTRB(24, 24, 24, 16),
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: typography.h2),
                if (subtitle != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      subtitle!,
                      style: typography.body.copyWith(color: colors.fgMuted),
                    ),
                  ),
              ],
            ),
          ),
          if (action != null) action!,
        ],
      ),
    );
  }
}
