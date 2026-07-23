import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/slider/slider.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('SliderWidget renders with label', (tester) async {
    await pumpTestApp(
      tester,
      const SliderWidget(value: 50, label: 'Volume'),
    );

    expect(find.text('Volume'), findsOneWidget);
  });

  testWidgets('SliderWidget renders without label', (tester) async {
    await pumpTestApp(
      tester,
      const SliderWidget(value: 25),
    );

    expect(find.byType(Slider), findsOneWidget);
  });

  testWidgets('SliderWidget fires onChanged callback', (tester) async {
    var changed = false;
    await pumpTestApp(
      tester,
      SliderWidget(value: 50, onChanged: (v) => changed = true),
    );

    final slider = tester.widget<Slider>(find.byType(Slider));
    slider.onChanged!(75);
    expect(changed, isTrue);
  });
}
