import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class FormFieldInfo extends StatelessWidget {
  final String text;
  final bool isError;

  const FormFieldInfo({
    super.key,
    required this.text,
    this.isError = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.only(top: 4, left: 4),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          color: isError ? colors.danger : colors.fgMuted,
        ),
      ),
    );
  }
}
