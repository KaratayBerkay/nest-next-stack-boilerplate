import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/layout/page_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders page title', (tester) async {
    await pumpTestApp(
      tester,
      const PageHeader(title: 'Settings'),
    );

    expect(find.text('Settings'), findsOneWidget);
  });

  testWidgets('renders subtitle when provided', (tester) async {
    await pumpTestApp(
      tester,
      const PageHeader(
        title: 'Settings',
        subtitle: 'Manage your preferences',
      ),
    );

    expect(find.text('Settings'), findsOneWidget);
    expect(find.text('Manage your preferences'), findsOneWidget);
  });

  testWidgets('renders action widget when provided', (tester) async {
    await pumpTestApp(
      tester,
      const PageHeader(
        title: 'Settings',
        action: Text('Action'),
      ),
    );

    expect(find.text('Action'), findsOneWidget);
  });
}
