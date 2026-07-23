import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/image_upload/image_upload.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('ImageUpload renders add button when empty', (tester) async {
    await pumpTestApp(
      tester,
      const ImageUpload(images: []),
    );

    expect(find.byIcon(Icons.add), findsOneWidget);
  });

  testWidgets('ImageUpload fires onPick callback', (tester) async {
    var picked = false;
    await pumpTestApp(
      tester,
      ImageUpload(images: [], onPick: () => picked = true),
    );

    await tester.tap(find.byIcon(Icons.add));
    expect(picked, isTrue);
  });
}
