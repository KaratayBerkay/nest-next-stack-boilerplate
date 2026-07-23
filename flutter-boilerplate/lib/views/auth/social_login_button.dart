import 'package:flutter/material.dart';
import '../../constants/theme.dart';

class SocialLoginButton extends StatelessWidget {
  final String provider;
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;

  const SocialLoginButton({
    super.key,
    required this.provider,
    required this.icon,
    required this.label,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 44),
        side: BorderSide(color: colors.border),
      ),
    );
  }
}
