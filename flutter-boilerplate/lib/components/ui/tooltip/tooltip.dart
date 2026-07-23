import 'package:flutter/material.dart';

class TooltipWidget extends StatelessWidget {
  final String message;
  final Widget child;
  final double? verticalOffset;

  const TooltipWidget({
    super.key,
    required this.message,
    required this.child,
    this.verticalOffset,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: message,
      verticalOffset: verticalOffset ?? 20,
      preferBelow: true,
      child: child,
    );
  }
}
