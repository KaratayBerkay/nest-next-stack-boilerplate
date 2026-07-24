import 'package:flutter/material.dart';

class CardWidget extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? elevation;
  final VoidCallback? onTap;

  const CardWidget({
    super.key,
    required this.child,
    this.padding,
    this.elevation,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final card = Card(
      elevation: elevation ?? 0,
      margin: EdgeInsets.zero,
      clipBehavior: onTap != null ? Clip.antiAlias : Clip.none,
      child: Padding(
        padding: padding ?? const EdgeInsets.all(16),
        child: child,
      ),
    );

    if (onTap != null) {
      return InkWell(onTap: onTap, child: card);
    }
    return card;
  }
}
