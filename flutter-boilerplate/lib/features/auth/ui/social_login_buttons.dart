import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class SocialLoginButtons extends StatelessWidget {
  final VoidCallback? onGoogle;
  final VoidCallback? onApple;
  final VoidCallback? onGitHub;

  const SocialLoginButtons({
    super.key,
    this.onGoogle,
    this.onApple,
    this.onGitHub,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _SocialIconButton(
          icon: Icons.g_mobiledata_rounded,
          onPressed: onGoogle,
          color: colors.fg,
        ),
        const SizedBox(width: 12),
        _SocialIconButton(
          icon: Icons.apple_rounded,
          onPressed: onApple,
          color: colors.fg,
        ),
        const SizedBox(width: 12),
        _SocialIconButton(
          icon: Icons.code_rounded,
          onPressed: onGitHub,
          color: colors.fg,
        ),
      ],
    );
  }
}

class _SocialIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color color;

  const _SocialIconButton({
    required this.icon,
    this.onPressed,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: colors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.all(12),
      ),
      child: Icon(icon, color: color, size: 22),
    );
  }
}
