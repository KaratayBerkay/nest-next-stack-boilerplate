import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/popover/popover.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders trigger child', (tester) async {
    await pumpTestApp(
      tester,
      PopoverWidget(
        child: const Text('Open popover'),
        popoverBuilder: (_) => const Text('Popover content'),
      ),
    );
    expect(find.text('Open popover'), findsOneWidget);
  });

  testWidgets('shows popover content on tap', (tester) async {
    await pumpTestApp(
      tester,
      PopoverWidget(
        child: const Text('Tap me'),
        popoverBuilder: (_) => const Text('Content here'),
      ),
    );
    await tester.tap(find.text('Tap me'));
    await tester.pump();
    expect(find.text('Content here'), findsOneWidget);
  });

  testWidgets('dismisses popover on backdrop tap', (tester) async {
    await pumpTestApp(
      tester,
      PopoverWidget(
        child: const Text('Tap me'),
        popoverBuilder: (_) => const Text('Dismiss me'),
      ),
    );
    await tester.tap(find.text('Tap me'));
    await tester.pump();
    expect(find.text('Dismiss me'), findsOneWidget);
    await tester.tapAt(const Offset(0, 0));
    await tester.pump();
    expect(find.text('Dismiss me'), findsNothing);
  });
}
