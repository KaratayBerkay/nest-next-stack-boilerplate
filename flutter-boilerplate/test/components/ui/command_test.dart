import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/command/command.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders command items', (tester) async {
    await pumpTestApp(
      tester,
      const CommandWidget(items: [
        CommandItem(label: 'Copy'),
        CommandItem(label: 'Paste'),
      ],),
    );
    expect(find.text('Copy'), findsOneWidget);
    expect(find.text('Paste'), findsOneWidget);
  });

  testWidgets('renders with hintText', (tester) async {
    await pumpTestApp(
      tester,
      const CommandWidget(
        items: [CommandItem(label: 'Copy')],
        hintText: 'Type to search...',
      ),
    );
    expect(find.text('Type to search...'), findsOneWidget);
  });

  testWidgets('filters items on search', (tester) async {
    await pumpTestApp(
      tester,
      const CommandWidget(items: [
        CommandItem(label: 'Copy'),
        CommandItem(label: 'Paste'),
      ],),
    );
    await tester.enterText(find.byType(TextField), 'Pas');
    await tester.pump();
    expect(find.text('Paste'), findsOneWidget);
    expect(find.text('Copy'), findsNothing);
  });

  testWidgets('calls onSelected when item tapped', (tester) async {
    CommandItem? selected;
    await pumpTestApp(
      tester,
      CommandWidget(
        items: const [CommandItem(label: 'Cut')],
        onSelected: (item) => selected = item,
      ),
    );
    await tester.tap(find.text('Cut'));
    expect(selected, isNotNull);
    expect(selected!.label, 'Cut');
  });

  testWidgets('renders items with group labels', (tester) async {
    await pumpTestApp(
      tester,
      const CommandWidget(items: [
        CommandItem(label: 'Copy', group: 'Edit'),
        CommandItem(label: 'Save', group: 'File'),
      ],),
    );
    expect(find.text('Edit'), findsOneWidget);
    expect(find.text('File'), findsOneWidget);
  });

  testWidgets('renders CommandEmpty when no matches', (tester) async {
    await pumpTestApp(tester, const CommandEmpty());
    expect(find.text('No results found.'), findsOneWidget);
  });

  testWidgets('renders CommandItemWidget', (tester) async {
    await pumpTestApp(
      tester,
      const CommandItemWidget(label: 'Delete'),
    );
    expect(find.text('Delete'), findsOneWidget);
  });
}
