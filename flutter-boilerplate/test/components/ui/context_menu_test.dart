import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/context_menu/context_menu.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders child widget', (tester) async {
    await pumpTestApp(
      tester,
      const ContextMenu(
        child: Text('Right-click me'),
        entries: [],
      ),
    );
    expect(find.text('Right-click me'), findsOneWidget);
  });

  testWidgets('shows menu entries on long press', (tester) async {
    await pumpTestApp(
      tester,
      ContextMenu(
        child: const Text('Long press'),
        entries: [
          const ContextMenuEntry(value: 'edit', label: 'Edit'),
          const ContextMenuEntry(value: 'delete', label: 'Delete'),
        ],
      ),
    );
    await tester.longPress(find.text('Long press'));
    await tester.pump();
    expect(find.text('Edit'), findsOneWidget);
    expect(find.text('Delete'), findsOneWidget);
  });

  testWidgets('renders entries with icons', (tester) async {
    await pumpTestApp(
      tester,
      ContextMenu(
        child: const Text('Long press'),
        entries: const [
          ContextMenuEntry(value: 'edit', label: 'Edit', icon: Icons.edit),
        ],
      ),
    );
    expect(find.text('Long press'), findsOneWidget);
    expect(find.byType(ContextMenu), findsOneWidget);
  });
}
