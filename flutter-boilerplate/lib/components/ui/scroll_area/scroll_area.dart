import 'package:flutter/material.dart';

class ScrollAreaWidget extends StatelessWidget {
  final Widget child;

  const ScrollAreaWidget({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
      thumbVisibility: true,
      child: SingleChildScrollView(
        child: child,
      ),
    );
  }
}

class ScrollableArea extends StatelessWidget {
  final Widget child;

  const ScrollableArea({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scrollbar(
      thumbVisibility: true,
      child: CustomScrollView(
        slivers: [SliverFillRemaining(child: child)],
      ),
    );
  }
}
