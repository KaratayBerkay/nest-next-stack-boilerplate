import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/hover_card/hover_card.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('HoverCard renders trigger child', (tester) async {
    await pumpTestApp(
      tester,
      const HoverCard(
        content: Text('Tooltip content'),
        child: Text('Hover me'),
      ),
    );

    expect(find.text('Hover me'), findsOneWidget);
  });
}
