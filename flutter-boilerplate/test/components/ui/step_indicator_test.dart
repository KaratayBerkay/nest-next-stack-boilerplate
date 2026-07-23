import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/step_indicator/step_indicator.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('StepIndicator renders current step', (tester) async {
    await pumpTestApp(
      tester,
      const StepIndicator(currentStep: 0, totalSteps: 3),
    );

    expect(find.text('1'), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
    expect(find.text('3'), findsOneWidget);
  });

  testWidgets('StepIndicator shows check icon for completed steps', (tester) async {
    await pumpTestApp(
      tester,
      const StepIndicator(currentStep: 2, totalSteps: 3),
    );

    expect(find.byIcon(Icons.check), findsAtLeast(1));
  });
}
