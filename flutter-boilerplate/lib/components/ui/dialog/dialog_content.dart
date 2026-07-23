import 'package:flutter/material.dart';

class DialogContent extends StatelessWidget {
  final Widget child;

  const DialogContent({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: child,
    );
  }
}
