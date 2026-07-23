import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/alert_dialog/alert_dialog.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('AlertDialogWidget can be shown via show()', (tester) async {
    await pumpTestApp(tester, Scaffold(
      body: Builder(builder: (context) => TextButton(
        onPressed: () => AlertDialogWidget.show(
          context,
          title: 'Warning',
          description: 'This action is destructive.',
          confirmText: 'Proceed',
        ),
        child: const Text('Show'),
      )),
    ));

    await tester.tap(find.text('Show'));
    await tester.pumpAndSettle();

    expect(find.text('Warning'), findsOneWidget);
    expect(find.text('This action is destructive.'), findsOneWidget);
    expect(find.text('Proceed'), findsOneWidget);
  });
}
