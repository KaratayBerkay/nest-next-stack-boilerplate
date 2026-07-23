import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/date_picker/date_picker.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders with label', (tester) async {
    await pumpTestApp(
      tester,
      const DatePickerField(label: 'Birth date'),
    );
    expect(find.text('Birth date'), findsOneWidget);
  });

  testWidgets('renders with hintText', (tester) async {
    await pumpTestApp(
      tester,
      const DatePickerField(hintText: 'Pick a date'),
    );
    expect(find.text('Pick a date'), findsOneWidget);
  });

  testWidgets('renders default hint when not provided', (tester) async {
    await pumpTestApp(tester, const DatePickerField());
    expect(find.text('Select date'), findsOneWidget);
  });

  testWidgets('displays selected date value', (tester) async {
    final date = DateTime(2025, 1, 15);
    await pumpTestApp(tester, DatePickerField(value: date));
    expect(find.text('2025-01-15'), findsOneWidget);
  });

  testWidgets('renders calendar icon', (tester) async {
    await pumpTestApp(tester, const DatePickerField());
    expect(find.byIcon(Icons.calendar_today), findsOneWidget);
  });

  testWidgets('is read-only', (tester) async {
    await pumpTestApp(tester, const DatePickerField());
    final textField = tester.widget<TextField>(find.byType(TextField));
    expect(textField.readOnly, isTrue);
  });
}
