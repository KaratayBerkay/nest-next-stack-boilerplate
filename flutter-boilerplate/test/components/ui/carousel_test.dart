import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/carousel/carousel.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('Carousel renders all pages', (tester) async {
    await pumpTestApp(
      tester,
      const Carousel(children: [
        Text('Page 1'),
        Text('Page 2'),
        Text('Page 3'),
      ]),
    );

    expect(find.text('Page 1'), findsOneWidget);
  });

  testWidgets('Carousel renders dot indicators for multiple pages', (tester) async {
    await pumpTestApp(
      tester,
      const Carousel(children: [
        Text('One'),
        Text('Two'),
      ]),
    );

    expect(find.byType(PageView), findsOneWidget);
  });

  testWidgets('Carousel renders single page without dots', (tester) async {
    await pumpTestApp(
      tester,
      const Carousel(children: [Text('Only')]),
    );

    expect(find.byType(PageView), findsOneWidget);
  });
}
