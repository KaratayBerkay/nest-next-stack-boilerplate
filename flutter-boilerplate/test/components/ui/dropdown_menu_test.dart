import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/dropdown_menu/dropdown_menu.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders child trigger', (tester) async {
    await pumpTestApp(
      tester,
      const DropdownMenuList(
        child: Text('Open menu'),
        items: [],
      ),
    );
    expect(find.text('Open menu'), findsOneWidget);
  });

  testWidgets('renders dropdown items', (tester) async {
    await pumpTestApp(
      tester,
      DropdownMenuList(
        child: const Text('Open'),
        items: [
          DropdownMenuItemWidget(label: 'Profile'),
          DropdownMenuItemWidget(label: 'Settings'),
        ],
      ),
    );
    expect(find.text('Open'), findsOneWidget);
  });

  testWidgets('renders DropdownMenuSeparator', (tester) async {
    await pumpTestApp(tester, const DropdownMenuSeparator());
    expect(find.byType(DropdownMenuSeparator), findsOneWidget);
  });

  testWidgets('DropdownMenuLabel has correct label', (tester) async {
    final label = DropdownMenuLabel(label: 'Actions');
    expect(label.label, 'Actions');
  });
}
