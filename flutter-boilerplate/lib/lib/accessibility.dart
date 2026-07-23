import 'package:flutter/material.dart';

class A {
  A._();

  static Widget label({
    required String label,
    required Widget child,
    String? hint,
    bool exclude = false,
  }) {
    return Semantics(
      label: label,
      hint: hint,
      excludeSemantics: exclude,
      child: child,
    );
  }

  static Widget button({
    required String label,
    required Widget child,
  }) {
    return Semantics(
      label: label,
      button: true,
      excludeSemantics: true,
      child: child,
    );
  }

  static Widget image({
    required String label,
    required Widget child,
  }) {
    return Semantics(
      label: label,
      image: true,
      excludeSemantics: true,
      child: child,
    );
  }

  static Widget header({
    required String label,
    required Widget child,
    int level = 1,
  }) {
    assert(level >= 1 && level <= 6, 'Header level must be 1-6');
    return Semantics(
      label: label,
      header: true,
      child: child,
    );
  }

  static Widget link({
    required String label,
    required Widget child,
  }) {
    return Semantics(
      label: label,
      link: true,
      excludeSemantics: true,
      child: child,
    );
  }

  static double scale(double size, BuildContext context) {
    return MediaQuery.textScalerOf(context).scale(size);
  }
}
