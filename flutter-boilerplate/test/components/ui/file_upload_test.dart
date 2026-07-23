import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/file_upload/file_upload.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('FileUpload renders hint text', (tester) async {
    await pumpTestApp(
      tester,
      const FileUpload(hintText: 'Upload your file'),
    );

    expect(find.text('Upload your file'), findsOneWidget);
  });

  testWidgets('FileUpload renders file name', (tester) async {
    await pumpTestApp(
      tester,
      const FileUpload(fileName: 'report.pdf'),
    );

    expect(find.text('report.pdf'), findsOneWidget);
  });

  testWidgets('FileUpload fires onPick callback', (tester) async {
    var picked = false;
    await pumpTestApp(
      tester,
      FileUpload(onPick: () => picked = true),
    );

    await tester.tap(find.byType(InkWell));
    expect(picked, isTrue);
  });

  testWidgets('FileUpload fires onClear callback', (tester) async {
    var cleared = false;
    await pumpTestApp(
      tester,
      FileUpload(fileName: 'doc.txt', onClear: () => cleared = true),
    );

    await tester.tap(find.byIcon(Icons.close));
    expect(cleared, isTrue);
  });
}
