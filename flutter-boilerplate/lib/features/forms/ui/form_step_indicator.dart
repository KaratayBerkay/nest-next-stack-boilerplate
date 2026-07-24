import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class FormStepIndicator extends StatelessWidget {
  final int totalSteps;
  final int currentStep;
  final List<String>? stepLabels;

  const FormStepIndicator({
    super.key,
    required this.totalSteps,
    required this.currentStep,
    this.stepLabels,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: List.generate(totalSteps * 2 - 1, (index) {
            if (index.isOdd) {
              final stepIndex = index ~/ 2;
              final isActive = stepIndex < currentStep;
              return Expanded(
                child: Container(
                  height: 2,
                  color: isActive ? colors.brand : colors.border,
                ),
              );
            }
            final stepIndex = index ~/ 2;
            final isCompleted = stepIndex < currentStep;
            final isCurrent = stepIndex == currentStep;

            return _StepCircle(
              stepNumber: stepIndex + 1,
              isCompleted: isCompleted,
              isCurrent: isCurrent,
              colors: colors,
            );
          }),
        ),
        if (stepLabels != null) ...[
          const SizedBox(height: 8),
          Row(
            children: List.generate(totalSteps, (index) {
              final isCurrent = index == currentStep;
              return Expanded(
                child: Text(
                  stepLabels![index],
                  style: typography.caption.copyWith(
                    color: isCurrent ? colors.brand : colors.fgMuted,
                    fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w400,
                  ),
                  textAlign: TextAlign.center,
                ),
              );
            }),
          ),
        ],
      ],
    );
  }
}

class _StepCircle extends StatelessWidget {
  final int stepNumber;
  final bool isCompleted;
  final bool isCurrent;
  final AppColors colors;

  const _StepCircle({
    required this.stepNumber,
    required this.isCompleted,
    required this.isCurrent,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final Color bgColor;
    final Color fgColor;
    final Widget content;

    if (isCompleted) {
      bgColor = colors.brand;
      fgColor = colors.surface;
      content = Icon(Icons.check, size: 14, color: fgColor);
    } else if (isCurrent) {
      bgColor = colors.brand.withValues(alpha: 0.1);
      fgColor = colors.brand;
      content = Text(
        '$stepNumber',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: fgColor,
        ),
      );
    } else {
      bgColor = colors.surfaceHover;
      fgColor = colors.fgMuted;
      content = Text(
        '$stepNumber',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: fgColor,
        ),
      );
    }

    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: isCurrent ? Border.all(color: colors.brand, width: 2) : null,
      ),
      child: Center(child: content),
    );
  }
}
