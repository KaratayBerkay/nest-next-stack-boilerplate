import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/toggle/toggle.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders switch', (tester) async {
    await pumpTestApp(tester, const ToggleSwitch(value: false));
    expect(find.byType(Switch), findsOneWidget);
  });

  testWidgets('renders with label', (tester) async {
    await pumpTestApp(tester, const ToggleSwitch(value: false, label: 'Dark mode'));
    expect(find.text('Dark mode'), findsOneWidget);
    expect(find.byType(SwitchListTile), findsOneWidget);
  });

  testWidgets('handles onChanged callback', (tester) async {
    bool? toggled;
    await pumpTestApp(
      tester,
      ToggleSwitch(value: false, onChanged: (v) => toggled = v),
    );
    await tester.tap(find.byType(Switch));
    expect(toggled, isTrue);
  });

  testWidgets('shows correct value state', (tester) async {
    await pumpTestApp(tester, const ToggleSwitch(value: true));
    final switchWidget = tester.widget<Switch>(find.byType(Switch));
    expect(switchWidget.value, isTrue);
  });
}
