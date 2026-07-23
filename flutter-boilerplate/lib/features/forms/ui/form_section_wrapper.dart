import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/card/card.dart';

class FormSectionWrapper extends StatelessWidget {
  final String title;
  final String? description;
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const FormSectionWrapper({
    super.key,
    required this.title,
    this.description,
    required this.child,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return CardWidget(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: typography.h4),
          if (description != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                description!,
                style: typography.bodySmall.copyWith(color: colors.fgMuted),
              ),
            ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}
