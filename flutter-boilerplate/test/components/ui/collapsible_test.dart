import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/collapsible/collapsible.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('CollapsibleWidget shows child when initiallyExpanded', (tester) async {
    await pumpTestApp(
      tester,
      const CollapsibleWidget(
        title: Text('Section'),
        child: Text('Visible content'),
        initiallyExpanded: true,
      ),
    );

    expect(find.text('Visible content'), findsOneWidget);
  });

  testWidgets('CollapsibleWidget renders title', (tester) async {
    await pumpTestApp(
      tester,
      const CollapsibleWidget(
        title: Text('Title here'),
        child: Text('Body'),
      ),
    );

    expect(find.text('Title here'), findsOneWidget);
  });

  testWidgets('CollapsibleWidget toggles on tap', (tester) async {
    await pumpTestApp(
      tester,
      const CollapsibleWidget(
        title: Text('Toggle me'),
        child: Text('Revealed'),
      ),
    );

    await tester.tap(find.text('Toggle me'));
    await tester.pumpAndSettle();
    expect(find.text('Revealed'), findsOneWidget);
  });
}
