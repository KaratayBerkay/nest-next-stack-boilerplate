import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/context_menu/context_menu.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders child widget', (tester) async {
    await pumpTestApp(
      tester,
      const ContextMenu(
        entries: [],
        child: Text('Right-click me'),
      ),
    );
    expect(find.text('Right-click me'), findsOneWidget);
  });

  testWidgets('shows menu entries on long press', (tester) async {
    await pumpTestApp(
      tester,
      const ContextMenu(
        entries: [
          ContextMenuEntry(value: 'edit', label: 'Edit'),
          ContextMenuEntry(value: 'delete', label: 'Delete'),
        ],
        child: Text('Long press'),
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
      const ContextMenu(
        entries: [
          ContextMenuEntry(value: 'edit', label: 'Edit', icon: Icons.edit),
        ],
        child: Text('Long press'),
      ),
    );
    expect(find.text('Long press'), findsOneWidget);
    expect(find.byType(ContextMenu), findsOneWidget);
  });
}
