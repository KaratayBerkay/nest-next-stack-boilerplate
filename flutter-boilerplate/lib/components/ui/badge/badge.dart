import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum BadgeVariant { default_, secondary, success, warning, danger, info }

class Badge extends StatelessWidget {
  final String text;
  final BadgeVariant variant;
  final double fontSize;
  final IconData? icon;

  const Badge({
    super.key,
    required this.text,
    this.variant = BadgeVariant.default_,
    this.fontSize = 11,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final (Color bg, Color fg) = switch (variant) {
      BadgeVariant.default_ => (colors.brand.withValues(alpha: 0.1), colors.brand),
      BadgeVariant.secondary => (colors.surfaceHover, colors.fgMuted),
      BadgeVariant.success => (colors.success.withValues(alpha: 0.1), colors.success),
      BadgeVariant.warning => (colors.warning.withValues(alpha: 0.1), colors.warning),
      BadgeVariant.danger => (colors.danger.withValues(alpha: 0.1), colors.danger),
      BadgeVariant.info => (colors.info.withValues(alpha: 0.1), colors.info),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w500,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}

class BadgeCount extends StatelessWidget {
  final int count;
  final Color? color;

  const BadgeCount({super.key, required this.count, this.color});

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();

    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        color: color ?? colors.danger,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        count > 99 ? '99+' : '$count',
        style: TextStyle(
          color: colors.surface,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class BadgeButton extends StatelessWidget {
  final String text;
  final VoidCallback? onTap;
  final BadgeVariant variant;

  const BadgeButton({
    super.key,
    required this.text,
    this.onTap,
    this.variant = BadgeVariant.default_,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Badge(text: text, variant: variant),
    );
  }
}
