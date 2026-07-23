import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/sheet/sheet.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders sheet child', (tester) async {
    await pumpTestApp(
      tester,
      const SheetWidget(child: Text('Sheet content')),
    );
    expect(find.text('Sheet content'), findsOneWidget);
  });

  testWidgets('renders as DraggableScrollableSheet', (tester) async {
    await pumpTestApp(
      tester,
      const SheetWidget(child: Text('Content')),
    );
    expect(find.byType(DraggableScrollableSheet), findsOneWidget);
  });

  testWidgets('show displays bottom sheet', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    SheetWidget.show<void>(
      tester.element(find.byType(SizedBox)),
      child: const Text('Bottom sheet content'),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('Bottom sheet content'), findsOneWidget);
  });

  testWidgets('show uses custom initial size', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    SheetWidget.show<void>(
      tester.element(find.byType(SizedBox)),
      child: const Text('Sheet'),
      initial: 0.75,
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('Sheet'), findsOneWidget);
  });
}
