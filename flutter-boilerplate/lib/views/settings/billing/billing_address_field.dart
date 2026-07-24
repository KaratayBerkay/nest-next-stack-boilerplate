import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class BillingAddressField extends StatelessWidget {
  final String? initialValue;
  final String label;
  final String? hintText;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;

  const BillingAddressField({
    super.key,
    this.initialValue,
    this.label = 'Billing Address',
    this.hintText,
    this.controller,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: colors.fg,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hintText ?? 'Enter your billing address',
            hintStyle: TextStyle(color: colors.fgMuted, fontSize: 14),
            prefixIcon: Icon(
              Icons.location_on_outlined,
              color: colors.fgMuted,
              size: 20,
            ),
          ),
          onChanged: onChanged,
        ),
      ],
    );
  }
}
