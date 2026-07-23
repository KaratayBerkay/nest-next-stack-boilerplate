import 'package:flutter/material.dart';

import '../../components/ui/button/button.dart';
import '../../constants/theme.dart';

class DowngradeSection extends StatelessWidget {
  final String targetTier;
  final String? error;
  final VoidCallback onConfirm;

  const DowngradeSection({
    super.key,
    required this.targetTier,
    this.error,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (error != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              error!,
              style: TextStyle(fontSize: 13, color: colors.danger),
              key: const Key('checkout-error'),
            ),
          ),
        Button(
          fullWidth: true,
          variant: ButtonVariant.outline,
          onPressed: onConfirm,
          child: const Text('Confirm Downgrade'),
        ),
      ],
    );
  }
}
