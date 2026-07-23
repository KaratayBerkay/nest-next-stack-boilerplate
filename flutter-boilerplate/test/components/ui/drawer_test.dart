import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/drawer/drawer.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('DrawerWidget renders child', (tester) async {
    await pumpTestApp(tester, const DrawerWidget(child: Text('Menu content')));

    expect(find.text('Menu content'), findsOneWidget);
  });
}
