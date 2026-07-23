import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final EdgeInsetsGeometry padding;

  const SettingsSection({
    super.key,
    required this.title,
    required this.children,
    this.padding = const EdgeInsets.fromLTRB(24, 0, 24, 24),
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 8, left: 4),
            child: Text(
              title.toUpperCase(),
              style: typography.caption.copyWith(
                color: colors.fgMuted,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
          ...children,
        ],
      ),
    );
  }
}
