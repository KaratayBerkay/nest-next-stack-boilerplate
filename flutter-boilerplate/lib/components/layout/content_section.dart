import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class ContentSection extends StatelessWidget {
  final String title;
  final List<Widget>? actions;
  final Widget child;
  final EdgeInsetsGeometry padding;

  const ContentSection({
    super.key,
    required this.title,
    this.actions,
    required this.child,
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
          Row(
            children: [
              Expanded(
                child: Text(title, style: typography.h3),
              ),
              if (actions != null)
                ...actions!,
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}
