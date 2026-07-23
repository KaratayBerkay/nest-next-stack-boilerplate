import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/dialog/dialog.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('DialogWidget can be shown via show()', (tester) async {
    await pumpTestApp(tester, Scaffold(
      body: Builder(builder: (context) => TextButton(
        onPressed: () => DialogWidget.show<void>(
          context,
          title: 'Confirm',
          description: 'Are you sure?',
          actions: [TextButton(onPressed: () {}, child: const Text('OK'))],
        ),
        child: const Text('Show'),
      )),
    ));

    await tester.tap(find.text('Show'));
    await tester.pumpAndSettle();

    expect(find.text('Confirm'), findsOneWidget);
    expect(find.text('Are you sure?'), findsOneWidget);
  });
}
