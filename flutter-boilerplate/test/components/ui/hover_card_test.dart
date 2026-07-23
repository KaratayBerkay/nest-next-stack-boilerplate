import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/hover_card/hover_card.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('HoverCard renders trigger child', (tester) async {
    await pumpTestApp(
      tester,
      const HoverCard(
        child: Text('Hover me'),
        content: Text('Tooltip content'),
      ),
    );

    expect(find.text('Hover me'), findsOneWidget);
  });
}
