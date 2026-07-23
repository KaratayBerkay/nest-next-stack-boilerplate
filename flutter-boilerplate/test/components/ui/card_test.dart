import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/card/card.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('CardWidget renders child content', (tester) async {
    await pumpTestApp(
      tester,
      const CardWidget(child: Text('Card content')),
    );

    expect(find.text('Card content'), findsOneWidget);
  });

  testWidgets('CardWidget supports custom elevation', (tester) async {
    await pumpTestApp(
      tester,
      const CardWidget(elevation: 4, child: Text('Raised')),
    );

    expect(find.text('Raised'), findsOneWidget);
  });

  testWidgets('CardWidget supports onTap callback', (tester) async {
    var tapped = false;
    await pumpTestApp(
      tester,
      CardWidget(
        child: const Text('Tap me'),
        onTap: () => tapped = true,
      ),
    );

    await tester.tap(find.text('Tap me'));
    expect(tapped, isTrue);
  });
}
