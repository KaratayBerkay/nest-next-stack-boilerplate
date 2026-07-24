import 'package:flutter/material.dart';

class StepIndicator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String>? labels;

  const StepIndicator({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    this.labels,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Row(
      children: List.generate(totalSteps, (i) {
        final isCompleted = i < currentStep;
        final isCurrent = i == currentStep;
        final stepColor = isCompleted
            ? colors.primary
            : (isCurrent ? colors.primary : colors.outline);

        return Expanded(
          child: Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: isCompleted ? stepColor : Colors.transparent,
                  shape: BoxShape.circle,
                  border: Border.all(color: stepColor, width: 2),
                ),
                child: Center(
                  child: isCompleted
                      ? Icon(Icons.check, size: 14, color: colors.onPrimary)
                      : Text(
                          '${i + 1}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isCurrent
                                ? stepColor
                                : colors.onSurface.withValues(alpha: 0.6),
                          ),
                        ),
                ),
              ),
              if (i < totalSteps - 1)
                Expanded(
                  child: Container(
                    height: 2,
                    color: isCompleted ? colors.primary : colors.outline,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }
}
