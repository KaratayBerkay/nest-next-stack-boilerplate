import 'package:flutter/material.dart';

class ExitAnimationController {
  final AnimationController? controller;

  ExitAnimationController({this.controller});

  Future<void> playExitAnimation() async {
    if (controller != null) {
      await controller!.reverse();
    }
  }

  static Widget wrapWithFadeTransition({
    required AnimationController controller,
    required Widget child,
  }) {
    return FadeTransition(
      opacity: controller,
      child: child,
    );
  }

  static Widget wrapWithSlideTransition({
    required AnimationController controller,
    required Widget child,
    Offset slideOffset = const Offset(0, 0.1),
  }) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset.zero,
        end: slideOffset,
      ).animate(controller),
      child: child,
    );
  }
}
