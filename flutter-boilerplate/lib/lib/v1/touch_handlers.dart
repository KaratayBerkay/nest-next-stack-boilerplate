import 'package:flutter/material.dart';

void handleSwipeDismiss(
  AnimationController controller,
  VoidCallback onDismissed,
) {
  controller.forward().then((_) => onDismissed());
}

void handleLongPress(VoidCallback onLongPress) {
  onLongPress();
}
