import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';

class NavigationButtons extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final VoidCallback? onDone;
  final bool canProceed;

  const NavigationButtons({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    this.onBack,
    this.onNext,
    this.onDone,
    this.canProceed = true,
  });

  @override
  Widget build(BuildContext context) {
    final isFirst = currentStep == 0;
    final isLast = currentStep == totalSteps - 1;

    return Row(
      children: [
        if (!isFirst)
          Button(
            variant: ButtonVariant.outline,
            onPressed: onBack,
            child: const Text('Back'),
          ),
        if (!isFirst) const SizedBox(width: 12),
        Expanded(
          child: isLast
              ? Button(
                  onPressed: canProceed ? onDone : null,
                  fullWidth: true,
                  child: const Text('Send Invites'),
                )
              : Button(
                  onPressed: canProceed ? onNext : null,
                  fullWidth: true,
                  child: const Text('Next'),
                ),
        ),
      ],
    );
  }
}
