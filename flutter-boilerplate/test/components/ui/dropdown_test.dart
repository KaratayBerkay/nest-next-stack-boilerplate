import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/dropdown/dropdown.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('DropdownWidget renders label and value', (tester) async {
    await pumpTestApp(
      tester,
      DropdownWidget(
        label: 'Country',
        value: 'US',
        items: const [DropdownMenuItem(value: 'US', child: Text('US'))],
      ),
    );

    expect(find.text('Country'), findsOneWidget);
    expect(find.text('US'), findsOneWidget);
  });
}
