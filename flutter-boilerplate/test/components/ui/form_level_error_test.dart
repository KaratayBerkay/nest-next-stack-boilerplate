import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/form_level_error/form_level_error.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders nothing when error is null', (tester) async {
    await pumpTestApp(tester, const FormLevelError());

    expect(find.byType(FormLevelError), findsOneWidget);
  });

  testWidgets('renders error message', (tester) async {
    await pumpTestApp(
      tester,
      const FormLevelError(error: 'Invalid input'),
    );

    expect(find.text('Invalid input'), findsOneWidget);
  });

  testWidgets('renders dismiss button when onDismiss provided', (tester) async {
    var dismissed = false;
    await pumpTestApp(
      tester,
      FormLevelError(
        error: 'Error',
        onDismiss: () => dismissed = true,
      ),
    );

    expect(find.byIcon(Icons.close), findsOneWidget);

    await tester.tap(find.byIcon(Icons.close));
    expect(dismissed, isTrue);
  });
}
