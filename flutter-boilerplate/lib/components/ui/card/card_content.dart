import 'package:flutter/material.dart';

class CardContent extends StatelessWidget {
  final Widget child;

  const CardContent({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: child,
    );
  }
}
