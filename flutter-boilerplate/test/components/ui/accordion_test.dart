import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/accordion/accordion.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders item titles', (tester) async {
    await pumpTestApp(
      tester,
      const AccordionWidget(
        items: [
          AccordionItem(title: 'Section 1', content: Text('Content 1')),
          AccordionItem(title: 'Section 2', content: Text('Content 2')),
        ],
      ),
    );

    expect(find.text('Section 1'), findsOneWidget);
    expect(find.text('Section 2'), findsOneWidget);
  });
}
