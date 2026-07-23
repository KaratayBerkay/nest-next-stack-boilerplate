import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class Separator extends StatelessWidget {
  final double thickness;
  final double? height;
  final EdgeInsetsGeometry? margin;

  const Separator({
    super.key,
    this.thickness = 1,
    this.height,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      height: height ?? thickness,
      margin: margin ?? const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: colors.border,
        borderRadius: BorderRadius.circular(thickness / 2),
      ),
    );
  }
}

class VerticalSeparator extends StatelessWidget {
  final double thickness;
  final double? width;
  final EdgeInsetsGeometry? margin;

  const VerticalSeparator({
    super.key,
    this.thickness = 1,
    this.width,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: width ?? thickness,
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: colors.border,
        borderRadius: BorderRadius.circular(thickness / 2),
      ),
    );
  }
}
