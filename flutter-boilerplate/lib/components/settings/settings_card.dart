import 'package:flutter/material.dart';

import '../../components/ui/card/card.dart';

class SettingsCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const SettingsCard({
    super.key,
    required this.child,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return CardWidget(
      padding: padding ?? EdgeInsets.zero,
      child: child,
    );
  }
}
