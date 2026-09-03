import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/alert_dialog/alert_dialog.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('AlertDialogWidget can be shown via show()', (tester) async {
    await pumpTestApp(
      tester,
      Scaffold(
        body: Builder(
          builder: (context) => TextButton(
            onPressed: () => AlertDialogWidget.show(
              context,
              title: 'Warning',
              description: 'This action is destructive.',
              confirmText: 'Proceed',
            ),
            child: const Text('Show'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Show'));
    await tester.pumpAndSettle();

    expect(find.text('Warning'), findsOneWidget);
    expect(find.text('This action is destructive.'), findsOneWidget);
    expect(find.text('Proceed'), findsOneWidget);
  });

  // Regression: same wrong-BuildContext-pop defect independently found and
  // fixed in confirm_dialog.dart (MOB-030) — see that test file's matching
  // case for why a single-Navigator harness can't catch this class of bug.
  testWidgets('dismisses correctly when shown from a nested Navigator',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Navigator(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (context) => Scaffold(
              body: Builder(
                builder: (innerContext) => TextButton(
                  onPressed: () => AlertDialogWidget.show(
                    innerContext,
                    title: 'Nested Warning',
                    description: 'Nested description.',
                  ),
                  child: const Text('Show'),
                ),
              ),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Show'));
    await tester.pumpAndSettle();
    expect(find.text('Nested Warning'), findsOneWidget);

    await tester.tap(find.text('Confirm'));
    await tester.pumpAndSettle();
    expect(find.text('Nested Warning'), findsNothing);
  });
}
