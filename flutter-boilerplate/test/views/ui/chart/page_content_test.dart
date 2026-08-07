import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/views/ui/chart/page_content.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../../test_helpers.dart';

void main() {
  testWidgets('renders line, bar, and area sections without error',
      (tester) async {
    await pumpTestApp(tester, const ChartDemoPage(lang: 'en'));
    await tester.pumpAndSettle();

    expect(find.text('Line Chart'), findsOneWidget);
    expect(find.text('Bar Chart'), findsOneWidget);

    // The area-chart section is below the fold at the default test viewport
    // size — scroll the page's own ListView down to reach it.
    await tester.scrollUntilVisible(
      find.text('Area Chart'),
      300,
      scrollable: find.byType(Scrollable),
    );
    expect(find.text('Area Chart'), findsOneWidget);

    expect(tester.takeException(), isNull);
  });
}
