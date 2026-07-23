import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/combobox/combobox.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders with label', (tester) async {
    await pumpTestApp(
      tester,
      const ComboboxWidget(
        items: ['Option 1', 'Option 2'],
        label: 'Choose',
      ),
    );
    expect(find.text('Choose'), findsOneWidget);
  });

  testWidgets('renders with hintText', (tester) async {
    await pumpTestApp(
      tester,
      const ComboboxWidget(
        items: ['Option 1', 'Option 2'],
        hintText: 'Select...',
      ),
    );
    expect(find.text('Select...'), findsOneWidget);
  });

  testWidgets('renders with errorText', (tester) async {
    await pumpTestApp(
      tester,
      const ComboboxWidget(
        items: ['Option 1', 'Option 2'],
        errorText: 'Required',
      ),
    );
    expect(find.text('Required'), findsOneWidget);
  });

  testWidgets('shows options when typing', (tester) async {
    await pumpTestApp(
      tester,
      const ComboboxWidget(items: ['Apple', 'Banana', 'Orange']),
    );
    await tester.enterText(find.byType(TextField), 'App');
    await tester.pump();
    expect(find.text('Apple'), findsOneWidget);
    expect(find.text('Banana'), findsNothing);
  });

  testWidgets('calls onChanged when option tapped', (tester) async {
    String? result;
    await pumpTestApp(
      tester,
      ComboboxWidget(
        items: const ['Alpha', 'Beta'],
        onChanged: (v) => result = v,
      ),
    );
    await tester.enterText(find.byType(TextField), 'Al');
    await tester.pump();
    await tester.tap(find.text('Alpha'));
    expect(result, 'Alpha');
  });
}
