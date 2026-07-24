import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/aspect_ratio/aspect_ratio.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('AspectRatioBox renders child', (tester) async {
    await pumpTestApp(
      tester,
      const AspectRatioBox(
        aspectRatio: 16 / 9,
        child: Text('Video player'),
      ),
    );

    expect(find.text('Video player'), findsOneWidget);
  });

  testWidgets('AspectRatioBox applies correct aspect ratio', (tester) async {
    await pumpTestApp(
      tester,
      const AspectRatioBox(
        aspectRatio: 4 / 3,
        child: SizedBox(width: 100, height: 100),
      ),
    );

    final aspectRatioWidget =
        tester.widget<AspectRatio>(find.byType(AspectRatio));
    expect(aspectRatioWidget.aspectRatio, equals(4 / 3));
  });
}
