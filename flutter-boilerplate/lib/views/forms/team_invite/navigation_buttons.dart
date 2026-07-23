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
            child: const Text('Back'),
            onPressed: onBack,
          ),
        if (!isFirst) const SizedBox(width: 12),
        Expanded(
          child: isLast
              ? Button(
                  child: const Text('Send Invites'),
                  onPressed: canProceed ? onDone : null,
                  fullWidth: true,
                )
              : Button(
                  child: const Text('Next'),
                  onPressed: canProceed ? onNext : null,
                  fullWidth: true,
                ),
        ),
      ],
    );
  }
}
