import 'package:flutter/material.dart' hide MenuBar;
import 'package:flutter_boilerplate/components/ui/menubar/menubar.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders menu bar items', (tester) async {
    await pumpTestApp(
      tester,
      const MenuBar(items: [
        MenuBarItem(label: 'File'),
        MenuBarItem(label: 'Edit'),
      ],),
    );
    expect(find.text('File'), findsOneWidget);
    expect(find.text('Edit'), findsOneWidget);
  });

  testWidgets('renders items with children', (tester) async {
    await pumpTestApp(
      tester,
      const MenuBar(items: [
        MenuBarItem(
          label: 'File',
          children: [
            MenuBarChildItem(value: 'new', label: 'New'),
            MenuBarChildItem(value: 'open', label: 'Open'),
          ],
        ),
      ],),
    );
    expect(find.text('File'), findsOneWidget);
  });

  testWidgets('renders dropdown arrow for items with children', (tester) async {
    await pumpTestApp(
      tester,
      const MenuBar(items: [
        MenuBarItem(
          label: 'File',
          children: [MenuBarChildItem(value: 'new', label: 'New')],
        ),
      ],),
    );
    expect(find.byIcon(Icons.keyboard_arrow_down), findsOneWidget);
  });

  testWidgets('renders clickable item without children', (tester) async {
    var tapped = false;
    await pumpTestApp(
      tester,
      MenuBar(items: [
        MenuBarItem(label: 'Help', onTap: () => tapped = true),
      ],),
    );
    await tester.tap(find.text('Help'));
    expect(tapped, isTrue);
  });
}
