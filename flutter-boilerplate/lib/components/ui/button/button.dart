import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum ButtonVariant { primary, secondary, ghost, danger, outline }

enum ButtonSize { sm, md, lg }

class Button extends StatelessWidget {
  final ButtonVariant variant;
  final ButtonSize size;
  final Widget child;
  final VoidCallback? onPressed;
  final bool loading;
  final bool disabled;
  final bool fullWidth;
  final IconData? icon;

  const Button({
    super.key,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    required this.child,
    this.onPressed,
    this.loading = false,
    this.disabled = false,
    this.fullWidth = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final isDisabled = disabled || loading;

    final style = _buildStyle(colors);

    Widget button;
    switch (variant) {
      case ButtonVariant.primary:
        button = ElevatedButton(
          style: style,
          onPressed: isDisabled ? null : onPressed,
          child: _buildContent(),
        );
      case ButtonVariant.secondary:
        button = ElevatedButton(
          style: style,
          onPressed: isDisabled ? null : onPressed,
          child: _buildContent(),
        );
      case ButtonVariant.ghost:
        button = TextButton(
          style: style,
          onPressed: isDisabled ? null : onPressed,
          child: _buildContent(),
        );
      case ButtonVariant.danger:
        button = ElevatedButton(
          style: style,
          onPressed: isDisabled ? null : onPressed,
          child: _buildContent(),
        );
      case ButtonVariant.outline:
        button = OutlinedButton(
          style: style,
          onPressed: isDisabled ? null : onPressed,
          child: _buildContent(),
        );
    }

    if (fullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }

  Widget _buildContent() {
    if (loading) {
      return const SizedBox(
        width: 16,
        height: 16,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }
    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: _iconSize),
          const SizedBox(width: 8),
          child,
        ],
      );
    }
    return child;
  }

  double get _iconSize {
    switch (size) {
      case ButtonSize.sm:
        return 14;
      case ButtonSize.md:
        return 16;
      case ButtonSize.lg:
        return 18;
    }
  }

  ButtonStyle _buildStyle(AppColors colors) {
    final padding = switch (size) {
      ButtonSize.sm => const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ButtonSize.md => const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      ButtonSize.lg => const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    };

    final borderRadius = BorderRadius.circular(6);

    switch (variant) {
      case ButtonVariant.primary:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.brand,
          foregroundColor: colors.surface,
          disabledBackgroundColor: colors.brand.withValues(alpha: 0.4),
          disabledForegroundColor: colors.surface.withValues(alpha: 0.6),
          padding: padding,
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
        );
      case ButtonVariant.secondary:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.surfaceAlt,
          foregroundColor: colors.fg,
          disabledBackgroundColor: colors.surfaceAlt.withValues(alpha: 0.5),
          padding: padding,
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
        );
      case ButtonVariant.ghost:
        return TextButton.styleFrom(
          foregroundColor: colors.fg,
          disabledForegroundColor: colors.fgMuted,
          padding: padding,
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
        );
      case ButtonVariant.danger:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.danger,
          foregroundColor: colors.surface,
          disabledBackgroundColor: colors.danger.withValues(alpha: 0.4),
          padding: padding,
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
        );
      case ButtonVariant.outline:
        return OutlinedButton.styleFrom(
          foregroundColor: colors.fg,
          side: BorderSide(color: colors.border),
          padding: padding,
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
        );
    }
  }
}
