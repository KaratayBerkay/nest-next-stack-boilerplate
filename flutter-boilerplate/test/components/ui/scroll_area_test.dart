import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/scroll_area/scroll_area.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders child widget', (tester) async {
    await pumpTestApp(
      tester,
      const ScrollAreaWidget(child: Text('Scrollable content')),
    );
    expect(find.text('Scrollable content'), findsOneWidget);
  });

  testWidgets('wraps child in scrollbar', (tester) async {
    await pumpTestApp(
      tester,
      const ScrollAreaWidget(child: Text('Content')),
    );
    expect(find.byType(Scrollbar), findsOneWidget);
    expect(find.byType(SingleChildScrollView), findsOneWidget);
  });

  testWidgets('renders ScrollableArea', (tester) async {
    await pumpTestApp(
      tester,
      const ScrollableArea(child: Text('Full page')),
    );
    expect(find.text('Full page'), findsOneWidget);
    expect(find.byType(CustomScrollView), findsOneWidget);
  });
}
