import 'package:flutter/material.dart';

class CardHeader extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const CardHeader({super.key, required this.child, this.padding});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: DefaultTextStyle(
        style: Theme.of(context).textTheme.titleMedium!,
        child: child,
      ),
    );
  }
}
