import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class FormErrorBanner extends StatelessWidget {
  final List<String> errors;
  final String? title;

  const FormErrorBanner({
    super.key,
    required this.errors,
    this.title,
  });

  @override
  Widget build(BuildContext context) {
    if (errors.isEmpty) return const SizedBox.shrink();

    final colors = AppColors.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.danger.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: colors.danger.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                title!,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: colors.danger,
                ),
              ),
            ),
          ...errors.map(
            (error) => Text(
              error,
              style: TextStyle(
                fontSize: 13,
                color: colors.danger,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
