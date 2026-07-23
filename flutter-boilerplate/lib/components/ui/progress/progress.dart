import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class ProgressWidget extends StatelessWidget {
  final double value;
  final double height;
  final Color? color;
  final Color? backgroundColor;

  const ProgressWidget({
    super.key,
    this.value = 0,
    this.height = 4,
    this.color,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return ClipRRect(
      borderRadius: BorderRadius.circular(height / 2),
      child: LinearProgressIndicator(
        value: value.clamp(0.0, 1.0),
        minHeight: height,
        backgroundColor: backgroundColor ?? colors.surfaceHover,
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? colors.brand,
        ),
      ),
    );
  }
}

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
    final colors = AppColors.of(context);
    return Row(
      children: List.generate(totalSteps, (i) {
        final isCompleted = i < currentStep;
        final isCurrent = i == currentStep;
        final stepColor = isCompleted ? colors.success : (isCurrent ? colors.brand : colors.border);

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
                      ? Icon(Icons.check, size: 14, color: colors.surface)
                      : Text(
                          '${i + 1}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isCurrent ? stepColor : colors.fgMuted,
                          ),
                        ),
                ),
              ),
              if (i < totalSteps - 1)
                Expanded(
                  child: Container(
                    height: 2,
                    color: isCompleted ? colors.success : colors.border,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }
}
