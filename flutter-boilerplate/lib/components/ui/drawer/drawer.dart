import 'package:flutter/material.dart';

class DrawerWidget extends StatelessWidget {
  final Widget child;
  final double width;

  const DrawerWidget({super.key, required this.child, this.width = 280});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: Drawer(
        child: child,
      ),
    );
  }
}
