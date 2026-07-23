import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class IconField extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? hintText;
  final bool obscureText;
  final TextEditingController? controller;

  const IconField({
    super.key,
    required this.icon,
    required this.label,
    this.hintText,
    this.obscureText = false,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return TextField(
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        prefixIcon: Icon(icon, color: colors.fgMuted),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: BorderSide(color: colors.border),
        ),
      ),
    );
  }
}
