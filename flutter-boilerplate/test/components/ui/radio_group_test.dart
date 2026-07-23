import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/radio_group/radio_group.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders radio options', (tester) async {
    await pumpTestApp(
      tester,
      const RadioGroupWidget(options: ['Option 1', 'Option 2', 'Option 3']),
    );
    expect(find.text('Option 1'), findsOneWidget);
    expect(find.text('Option 2'), findsOneWidget);
    expect(find.text('Option 3'), findsOneWidget);
  });

  testWidgets('preselects group value', (tester) async {
    await pumpTestApp(
      tester,
      const RadioGroupWidget(
        groupValue: 'Option 2',
        options: ['Option 1', 'Option 2'],
      ),
    );
    final group = tester.widget<RadioGroup<String>>(find.byType(RadioGroup<String>));
    expect(group.groupValue, 'Option 2');
  });

  testWidgets('calls onChanged when option selected', (tester) async {
    String? selected;
    await pumpTestApp(
      tester,
      RadioGroupWidget(
        options: const ['A', 'B'],
        onChanged: (v) => selected = v,
      ),
    );
    await tester.tap(find.text('B'));
    expect(selected, 'B');
  });

  testWidgets('renders RadioListTile for each option', (tester) async {
    await pumpTestApp(
      tester,
      const RadioGroupWidget(options: ['X', 'Y']),
    );
    expect(find.byType(RadioListTile<String>), findsNWidgets(2));
  });
}
