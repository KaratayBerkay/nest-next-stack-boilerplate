import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/page_header/page_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../../test_helpers.dart';

void main() {
  testWidgets('renders the title and description', (tester) async {
    await pumpTestApp(
      tester,
      const PageHeader(title: 'Dashboard', description: 'Overview'),
    );

    expect(find.text('Dashboard'), findsOneWidget);
    expect(find.text('Overview'), findsOneWidget);
  });

  testWidgets('omits the description row when none is given', (tester) async {
    await pumpTestApp(tester, const PageHeader(title: 'Dashboard'));

    expect(find.text('Dashboard'), findsOneWidget);
  });

  testWidgets('renders actions alongside the title', (tester) async {
    await pumpTestApp(
      tester,
      const PageHeader(title: 'Projects', actions: Text('New Project')),
    );

    expect(find.text('Projects'), findsOneWidget);
    expect(find.text('New Project'), findsOneWidget);
  });
}
