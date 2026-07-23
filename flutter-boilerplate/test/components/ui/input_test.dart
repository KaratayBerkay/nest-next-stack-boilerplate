import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/input/input.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders with label', (tester) async {
    await pumpTestApp(tester, const Input(label: 'Test Label'));
    expect(find.text('Test Label'), findsOneWidget);
  });

  testWidgets('renders with hintText', (tester) async {
    await pumpTestApp(tester, const Input(hintText: 'Enter text'));
    expect(find.text('Enter text'), findsOneWidget);
  });

  testWidgets('renders with helperText', (tester) async {
    await pumpTestApp(tester, const Input(helperText: 'Helper text'));
    expect(find.text('Helper text'), findsOneWidget);
  });

  testWidgets('renders with errorText', (tester) async {
    await pumpTestApp(tester, const Input(errorText: 'Error text'));
    expect(find.text('Error text'), findsOneWidget);
  });

  testWidgets('handles onChanged callback', (tester) async {
    String? value;
    await pumpTestApp(
      tester,
      Input(onChanged: (v) => value = v),
    );
    await tester.enterText(find.byType(TextField), 'hello');
    expect(value, 'hello');
  });

  testWidgets('renders with controller', (tester) async {
    final controller = TextEditingController(text: 'initial');
    await pumpTestApp(tester, Input(controller: controller));
    expect(find.text('initial'), findsOneWidget);
  });
}
