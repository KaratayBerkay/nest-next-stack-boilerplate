import 'package:flutter/material.dart';

class AspectRatioBox extends StatelessWidget {
  final double aspectRatio;
  final Widget child;

  const AspectRatioBox({
    super.key,
    required this.aspectRatio,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: aspectRatio,
      child: child,
    );
  }
}
