import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/resizable/resizable.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('ResizablePanel renders both panels', (tester) async {
    await tester.binding.setSurfaceSize(const Size(800, 600));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await pumpTestApp(
      tester,
      const SizedBox(
        width: 600,
        height: 200,
        child: ResizablePanel(
          leftPanel: Text('Left'),
          rightPanel: Text('Right'),
        ),
      ),
    );

    expect(find.text('Left'), findsOneWidget);
    expect(find.text('Right'), findsOneWidget);
  });

  testWidgets('ResizablePanel renders divider handle', (tester) async {
    await tester.binding.setSurfaceSize(const Size(800, 600));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await pumpTestApp(
      tester,
      const SizedBox(
        width: 600,
        height: 200,
        child: ResizablePanel(
          leftPanel: Text('A'),
          rightPanel: Text('B'),
        ),
      ),
    );

    expect(find.byType(GestureDetector), findsOneWidget);
  });
}
