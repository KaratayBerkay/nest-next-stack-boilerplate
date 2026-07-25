import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum CardVariant { defaultCard, elevated, interactive, outline, surface }

class CardWidget extends StatelessWidget {
  final CardVariant variant;
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  const CardWidget({
    super.key,
    this.variant = CardVariant.defaultCard,
    required this.child,
    this.padding,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    switch (variant) {
      case CardVariant.elevated:
        return Card(
          elevation: 4,
          margin: EdgeInsets.zero,
          clipBehavior: onTap != null ? Clip.antiAlias : Clip.none,
          child: Padding(
            padding: padding ?? const EdgeInsets.all(16),
            child: child,
          ),
        );
      case CardVariant.outline:
        final container = Container(
          decoration: BoxDecoration(
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          padding: padding ?? const EdgeInsets.all(16),
          child: child,
        );
        if (onTap != null) {
          return InkWell(onTap: onTap, child: container);
        }
        return container;
      case CardVariant.interactive:
        return Card(
          elevation: 0,
          margin: EdgeInsets.zero,
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: Padding(
              padding: padding ?? const EdgeInsets.all(16),
              child: child,
            ),
          ),
        );
      case CardVariant.surface:
        return Container(
          decoration: BoxDecoration(
            color: colors.surfaceAlt,
            borderRadius: BorderRadius.circular(8),
          ),
          padding: padding ?? const EdgeInsets.all(16),
          child: child,
        );
      case CardVariant.defaultCard:
        return Card(
          elevation: 0,
          margin: EdgeInsets.zero,
          clipBehavior: onTap != null ? Clip.antiAlias : Clip.none,
          child: Padding(
            padding: padding ?? const EdgeInsets.all(16),
            child: child,
          ),
        );
    }
  }
}
