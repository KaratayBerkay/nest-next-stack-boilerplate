import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/button/button.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('Button renders child text', (tester) async {
    await pumpTestApp(tester, const Button(child: Text('Click me')));

    expect(find.text('Click me'), findsOneWidget);
  });

  testWidgets('Button fires onPressed callback', (tester) async {
    var pressed = false;
    await pumpTestApp(
      tester,
      Button(
        child: const Text('Click'),
        onPressed: () => pressed = true,
      ),
    );

    await tester.tap(find.text('Click'));
    expect(pressed, isTrue);
  });

  testWidgets('Button shows loading state', (tester) async {
    await pumpTestApp(
      tester,
      const Button(child: Text('Save'), loading: true),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('Button does not fire when disabled', (tester) async {
    var pressed = false;
    await pumpTestApp(
      tester,
      Button(
        child: const Text('Disabled'),
        onPressed: () => pressed = true,
        disabled: true,
      ),
    );

    await tester.tap(find.text('Disabled'));
    expect(pressed, isFalse);
  });
}
