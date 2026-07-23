import 'package:flutter/material.dart';

class FadeSwitch extends StatelessWidget {
  final bool showFirst;
  final Widget first;
  final Widget second;

  const FadeSwitch({
    super.key,
    required this.showFirst,
    required this.first,
    required this.second,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      switchInCurve: Curves.easeIn,
      switchOutCurve: Curves.easeOut,
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: child,
        );
      },
      child: showFirst ? first : second,
    );
  }
}

class SlideFadeTransition extends StatelessWidget {
  final bool visible;
  final Widget child;

  const SlideFadeTransition({
    super.key,
    required this.visible,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSlide(
      duration: const Duration(milliseconds: 200),
      offset: visible ? Offset.zero : const Offset(0, 0.1),
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: visible ? 1.0 : 0.0,
        child: child,
      ),
    );
  }
}
