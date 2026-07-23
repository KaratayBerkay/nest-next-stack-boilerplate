import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/time_input/time_input.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('TimeInput renders hint text', (tester) async {
    await pumpTestApp(
      tester,
      const TimeInput(hintText: 'Pick a time'),
    );

    expect(find.text('Pick a time'), findsOneWidget);
  });

  testWidgets('TimeInput renders label', (tester) async {
    await pumpTestApp(
      tester,
      const TimeInput(label: 'Start time'),
    );

    expect(find.text('Start time'), findsOneWidget);
  });

  testWidgets('TimeInput displays selected time', (tester) async {
    await pumpTestApp(
      tester,
      const TimeInput(value: TimeOfDay(hour: 14, minute: 30)),
    );

    expect(find.text('14:30'), findsOneWidget);
  });

  testWidgets('TimeInput shows clock icon', (tester) async {
    await pumpTestApp(
      tester,
      const TimeInput(),
    );

    expect(find.byIcon(Icons.access_time), findsOneWidget);
  });
}
