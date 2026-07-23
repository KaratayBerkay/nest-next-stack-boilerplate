import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class IconButtonWidget extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final double size;
  final Color? color;
  final String? tooltip;

  const IconButtonWidget({
    super.key,
    required this.icon,
    this.onPressed,
    this.size = 20,
    this.color,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final btn = IconButton(
      icon: Icon(icon, size: size, color: color ?? colors.fg),
      onPressed: onPressed,
    );

    if (tooltip != null) {
      return Tooltip(message: tooltip!, child: btn);
    }
    return btn;
  }
}
