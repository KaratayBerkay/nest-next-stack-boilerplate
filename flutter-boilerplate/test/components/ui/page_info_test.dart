import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/page_info/page_info.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  const content = PageInfoContent(
    title: 'Page Title',
    description: 'Page description',
    sections: [
      PageInfoSection(title: 'Section 1', description: 'Section description'),
    ],
    tips: ['Tip 1', 'Tip 2'],
  );

  testWidgets('renders info button', (tester) async {
    await pumpTestApp(
      tester,
      const PageInfoButton(content: content),
    );

    expect(find.byIcon(Icons.info_outline), findsOneWidget);
  });

  testWidgets('opens dialog on tap', (tester) async {
    await pumpTestApp(
      tester,
      const PageInfoButton(content: content),
    );

    await tester.tap(find.byIcon(Icons.info_outline));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Page Title'), findsOneWidget);
    expect(find.text('Page description'), findsOneWidget);
    expect(find.text('Section 1'), findsOneWidget);
    expect(find.text('Tip 1'), findsOneWidget);
  });
}
