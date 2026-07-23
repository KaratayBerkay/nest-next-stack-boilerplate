import 'package:flutter/material.dart';

class PageNavWrapper extends StatelessWidget {
  final Widget child;
  final Key pageKey;

  const PageNavWrapper({
    super.key,
    required this.child,
    required this.pageKey,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      transitionBuilder: (child, animation) {
        return FadeTransition(opacity: animation, child: child);
      },
      child: KeyedSubtree(key: pageKey, child: child),
    );
  }
}
