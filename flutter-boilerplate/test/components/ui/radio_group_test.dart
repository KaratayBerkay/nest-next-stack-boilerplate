import 'package:flutter/material.dart' hide RadioGroup;
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/radio_group/radio_group.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders radio options', (tester) async {
    await pumpTestApp(
      tester,
      const RadioGroup(options: ['Option 1', 'Option 2', 'Option 3']),
    );
    expect(find.text('Option 1'), findsOneWidget);
    expect(find.text('Option 2'), findsOneWidget);
    expect(find.text('Option 3'), findsOneWidget);
  });

  testWidgets('preselects group value', (tester) async {
    await pumpTestApp(
      tester,
      const RadioGroup(
        groupValue: 'Option 2',
        options: ['Option 1', 'Option 2'],
      ),
    );
    final tiles = tester.widgetList<RadioListTile<String>>(find.byType(RadioListTile<String>)).toList();
    expect(tiles.any((t) => t.groupValue == 'Option 2'), isTrue);
  });

  testWidgets('calls onChanged when option selected', (tester) async {
    String? selected;
    await pumpTestApp(
      tester,
      RadioGroup(
        options: ['A', 'B'],
        onChanged: (v) => selected = v,
      ),
    );
    await tester.tap(find.text('B'));
    expect(selected, 'B');
  });

  testWidgets('renders RadioListTile for each option', (tester) async {
    await pumpTestApp(
      tester,
      const RadioGroup(options: ['X', 'Y']),
    );
    expect(find.byType(RadioListTile<String>), findsNWidgets(2));
  });
}
