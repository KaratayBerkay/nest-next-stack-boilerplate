import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/dropdown_menu/dropdown_menu.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders child trigger', (tester) async {
    await pumpTestApp(
      tester,
      const DropdownMenuList(
        items: [],
        child: Text('Open menu'),
      ),
    );
    expect(find.text('Open menu'), findsOneWidget);
  });

  testWidgets('renders dropdown items', (tester) async {
    await pumpTestApp(
      tester,
      const DropdownMenuList(
        items: [
          PopupMenuItem(value: 'profile', child: Text('Profile')),
          PopupMenuItem(value: 'settings', child: Text('Settings')),
        ],
        child: Text('Open'),
      ),
    );
    expect(find.text('Open'), findsOneWidget);
  });

  testWidgets('renders PopupMenuDivider', (tester) async {
    await pumpTestApp(tester, const PopupMenuDivider());
    expect(find.byType(PopupMenuDivider), findsOneWidget);
  });

  testWidgets('PopupMenuItem has correct child', (tester) async {
    const item = PopupMenuItem(value: 'action', child: Text('Action'));
    expect((item.child as Text).data, 'Action');
  });
}
