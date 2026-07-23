import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/field_info_button/field_info_button.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders info icon', (tester) async {
    await pumpTestApp(
      tester,
      const FieldInfoButton(description: 'Help text'),
    );

    expect(find.byIcon(Icons.info_outline), findsOneWidget);
  });
}
