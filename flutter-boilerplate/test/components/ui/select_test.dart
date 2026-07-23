import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/select/select.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders items', (tester) async {
    await pumpTestApp(
      tester,
      const SelectWidget(
        items: ['A', 'B'],
      ),
    );

    expect(find.byType(DropdownButtonFormField<String>), findsOneWidget);
  });

  testWidgets('renders with label', (tester) async {
    await pumpTestApp(
      tester,
      const SelectWidget(
        label: 'Country',
        items: ['US', 'UK'],
      ),
    );

    expect(find.text('Country'), findsOneWidget);
  });
}
