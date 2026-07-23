import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/tabs/tabs.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('TabsWidget renders tabs and children', (tester) async {
    await pumpTestApp(
      tester,
      const TabsWidget(
        tabs: [Tab(text: 'Tab A'), Tab(text: 'Tab B')],
        children: [
          Text('Content A'),
          Text('Content B'),
        ],
      ),
    );

    expect(find.text('Tab A'), findsOneWidget);
    expect(find.text('Tab B'), findsOneWidget);
  });
}
